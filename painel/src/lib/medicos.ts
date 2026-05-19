import { env } from "./env";
import { cacheGet, cacheSet, cacheInvalidate } from "./cache";
import { medicoListSchema, type Medico } from "@/schemas/medicos";

const CACHE_KEY = "medicos:list";

export type MedicoIndex = {
  list: Medico[];
  byTagId: Map<number, Medico[]>;
  displayByTagId: Map<number, string>;
  fetchedAt: number;
};

function buildDisplayName(medicos: Medico[]): string {
  const unique = [...new Set(medicos.map((m) => m.nome))];
  return unique.join(" / ");
}

async function fetchAndIndex(): Promise<MedicoIndex> {
  const res = await fetch(env.MEDICOS_API_URL, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`medicos API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const raw = await res.json();
  const list = medicoListSchema.parse(raw);

  const byTagId = new Map<number, Medico[]>();
  for (const m of list) {
    const arr = byTagId.get(m.tagId);
    if (arr) arr.push(m);
    else byTagId.set(m.tagId, [m]);
  }

  const displayByTagId = new Map<number, string>();
  for (const [tagId, group] of byTagId.entries()) {
    displayByTagId.set(tagId, buildDisplayName(group));
  }

  return { list, byTagId, displayByTagId, fetchedAt: Date.now() };
}

export async function getMedicoIndex(forceRefresh = false): Promise<MedicoIndex> {
  if (!forceRefresh) {
    const cached = cacheGet<MedicoIndex>(CACHE_KEY);
    if (cached) return cached;
  }
  const fresh = await fetchAndIndex();
  cacheSet(CACHE_KEY, fresh, env.MEDICOS_CACHE_TTL_HOURS * 3600 * 1000);
  return fresh;
}

export function invalidateMedicos(): void {
  cacheInvalidate(CACHE_KEY);
}
