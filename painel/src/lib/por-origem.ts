import { pgrstGet, pgrstGetAllPaginated } from "./pgrst";
import { getMedicoIndex, type MedicoIndex } from "./medicos";
import { cacheGet, cacheSet } from "./cache";
import { brtStartOfDay, brtEndOfDayExclusive } from "./brt";
import type { PorOrigemQuery, PorOrigemRow } from "@/schemas/por-origem";

type ContactWithEmbedded = {
  id: number;
  name: string | null;
  number: string | null;
  createdAt: string;
  companyId: number;
  Tickets: Array<{
    companyId: number;
    TicketTags: Array<{
      Tags: { id: number; name: string; tagType: string | null } | null;
    }>;
  }>;
};

const CONTACT_SELECT =
  "id,name,number,createdAt,companyId," +
  "Tickets(companyId,TicketTags(Tags(id,name,tagType)))";

const RESPONSE_CACHE_TTL_MS = 5 * 60_000;

type CachedResult = { rows: PorOrigemRow[]; totalContatos: number };

function cacheKey(q: PorOrigemQuery): string {
  return [
    "por-origem",
    q.companyId,
    q.from,
    q.to,
    q.medicoTagId ?? "",
    q.uf ?? "",
    q.tipo ?? "",
    q.bucket,
  ].join("|");
}

function buildContactsPath(
  q: PorOrigemQuery,
  restrictIds: number[] | undefined,
): string {
  const parts: string[] = [
    `companyId=eq.${q.companyId}`,
    `createdAt=gte.${brtStartOfDay(q.from)}`,
    `createdAt=lt.${brtEndOfDayExclusive(q.to)}`,
  ];
  if (restrictIds && restrictIds.length > 0) {
    parts.push(`id=in.(${restrictIds.join(",")})`);
  }
  return (
    `/Contacts?${parts.join("&")}` +
    `&select=${encodeURIComponent(CONTACT_SELECT)}` +
    `&order=createdAt.asc`
  );
}

async function fetchContactIdsByMedicoTag(q: PorOrigemQuery): Promise<number[]> {
  const path =
    `/Tickets?companyId=eq.${q.companyId}` +
    `&select=contactId,TicketTags!inner(tagId)` +
    `&TicketTags.tagId=eq.${q.medicoTagId}`;
  const { data } = await pgrstGetAllPaginated<{ contactId: number | null }>(
    path,
    1000,
    6,
  );
  const ids = new Set<number>();
  for (const t of data) if (t.contactId != null) ids.add(t.contactId);
  return [...ids];
}

function rowFromContact(c: ContactWithEmbedded, medicos: MedicoIndex): PorOrigemRow {
  const medicoSet = new Set<string>();
  const crmSet = new Set<string>();
  const ufSet = new Set<string>();
  for (const t of c.Tickets || []) {
    if (t.companyId !== c.companyId) continue;
    for (const tt of t.TicketTags || []) {
      const tag = tt.Tags;
      if (!tag) continue;
      const display = medicos.displayByTagId.get(tag.id);
      if (display) {
        medicoSet.add(display);
        // Um tagId pode agrupar vários médicos (byTagId é lista) com UFs
        // distintas. Mantém o valor cru: normalizar em maiúsculas quebraria
        // nomes de país ("Emirados Árabes").
        for (const m of medicos.byTagId.get(tag.id) ?? []) {
          if (m.uf) ufSet.add(m.uf);
        }
      } else if (tag.tagType === "CRM") {
        crmSet.add(tag.name);
      }
    }
  }
  return {
    contactId: c.id,
    name: c.name,
    number: c.number,
    createdAt: c.createdAt,
    tags_crm: [...crmSet].sort(),
    medicos: [...medicoSet].sort(),
    ufs: [...ufSet].sort(),
  };
}

function matchesBucket(row: PorOrigemRow, bucket: PorOrigemQuery["bucket"]): boolean {
  switch (bucket) {
    case "with_medico":
      return row.medicos.length > 0;
    case "without_medico":
      return row.medicos.length === 0;
    case "with_crm":
      return row.tags_crm.length > 0;
    default:
      return true;
  }
}

function buildUfTipoMatcher(q: PorOrigemQuery, medicos: MedicoIndex) {
  if (!q.uf && !q.tipo) return null;
  // pré-computa set de displayNames que satisfazem UF/tipo
  const allowed = new Set<string>();
  for (const [tagId, group] of medicos.byTagId.entries()) {
    const display = medicos.displayByTagId.get(tagId);
    if (!display) continue;
    if (
      group.some(
        (m) =>
          (!q.uf || (m.uf || "").toUpperCase() === q.uf!.toUpperCase()) &&
          (!q.tipo || (m.tipo || "") === q.tipo),
      )
    ) {
      allowed.add(display);
    }
  }
  return (row: PorOrigemRow) =>
    row.medicos.length > 0 && row.medicos.some((m) => allowed.has(m));
}

export async function fetchPorOrigemAll(q: PorOrigemQuery): Promise<CachedResult> {
  const key = cacheKey(q);
  const cached = cacheGet<CachedResult>(key);
  if (cached) return cached;

  const t0 = Date.now();
  const medicos = await getMedicoIndex();

  let restrictIds: number[] | undefined;
  if (q.medicoTagId) {
    restrictIds = await fetchContactIdsByMedicoTag(q);
    if (restrictIds.length === 0) {
      const empty = { rows: [], totalContatos: 0 };
      cacheSet(key, empty, RESPONSE_CACHE_TTL_MS);
      return empty;
    }
  }
  const t1 = Date.now();

  const path = buildContactsPath(q, restrictIds);
  // Para id=in.(...) com poucos IDs, batches menores. Senão batches maiores.
  const pageSize = restrictIds && restrictIds.length < 500 ? 500 : 1000;
  const concurrency = 6;
  const { data, total } = await pgrstGetAllPaginated<ContactWithEmbedded>(
    path,
    pageSize,
    concurrency,
  );
  const t2 = Date.now();

  const matchUfTipo = buildUfTipoMatcher(q, medicos);
  const rows: PorOrigemRow[] = [];
  for (const c of data) {
    const r = rowFromContact(c, medicos);
    if (!matchesBucket(r, q.bucket)) continue;
    if (matchUfTipo && !matchUfTipo(r)) continue;
    rows.push(r);
  }
  const t3 = Date.now();

  console.log(
    `[por-origem] co=${q.companyId} from=${q.from} to=${q.to} medicoTagId=${q.medicoTagId ?? "-"}` +
      ` | ids=${t1 - t0}ms fetch=${t2 - t1}ms map=${t3 - t2}ms total=${t3 - t0}ms` +
      ` | raw=${data.length} kept=${rows.length} contactsTotal=${total}`,
  );

  const result: CachedResult = { rows, totalContatos: total };
  cacheSet(key, result, RESPONSE_CACHE_TTL_MS);
  return result;
}

export function summarize(rows: PorOrigemRow[], totalContatos: number) {
  const comMedico = rows.filter((r) => r.medicos.length > 0).length;
  const comCRM = rows.filter((r) => r.tags_crm.length > 0).length;
  const semClassificacao = rows.filter(
    (r) => r.medicos.length === 0 && r.tags_crm.length === 0,
  ).length;

  const medicoCount = new Map<string, number>();
  const crmCount = new Map<string, number>();
  for (const r of rows) {
    for (const m of r.medicos) medicoCount.set(m, (medicoCount.get(m) || 0) + 1);
    for (const c of r.tags_crm) crmCount.set(c, (crmCount.get(c) || 0) + 1);
  }
  const topMedicos = [...medicoCount.entries()]
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
  const topCRM = [...crmCount.entries()]
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return { totalContatos, comMedico, comCRM, semClassificacao, topMedicos, topCRM };
}

// re-export type for routes
export type { CachedResult };
