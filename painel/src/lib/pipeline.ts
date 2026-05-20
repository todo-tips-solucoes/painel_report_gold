import { pgrstGet, pgrstGetAllPaginated } from "./pgrst";
import { cacheGet, cacheSet } from "./cache";
import { brtStartOfDay, brtEndOfDayExclusive, brtToday } from "./brt";
import { rangeLastNDays } from "./date-presets";
import type {
  PipelineQuery,
  PipelineResponse,
  StageStats,
  Oportunidade,
} from "@/schemas/pipeline";

const TTL_MS = 5 * 60_000;

/** Faz best-effort parse de strings tipo "800.00", "R$ 1.200,00", "1.200", "" */
function parseValor(v: string | null | undefined): number | null {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  // remove "R$", espaços
  const cleaned = s.replace(/R\$\s*/i, "").trim();
  // se tem vírgula e ponto: assume formato BR "1.200,00" — vira "1200.00"
  let normalized = cleaned;
  if (cleaned.includes(",") && cleaned.includes(".")) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (cleaned.includes(",") && !cleaned.includes(".")) {
    normalized = cleaned.replace(",", ".");
  }
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

type OppRaw = {
  id: number;
  name: string | null;
  etapadofunil: string | null;
  produto: string | null;
  fonte: string | null;
  campanha: string | null;
  valor: string | null;
  userId: number | null;
  createdAt: string;
  contactId: number;
  ticketId: number;
};

/**
 * Resolve `from`/`to` opcionais para uma janela ISO UTC.
 * Default quando ambos ausentes: últimos 90 dias (oportunidades costumam ter
 * vida útil maior que o ciclo operacional de 30 dias).
 */
function resolveWindow(
  from?: string,
  to?: string,
): { range: { from: string; to: string }; startIso: string; endIso: string } {
  const today = brtToday();
  const defaults = rangeLastNDays(90);
  const f = from ?? defaults.from;
  const t = to ?? today;
  return {
    range: { from: f, to: t },
    startIso: brtStartOfDay(f),
    endIso: brtEndOfDayExclusive(t),
  };
}

export async function fetchPipeline(q: PipelineQuery): Promise<PipelineResponse> {
  const { range, startIso, endIso } = resolveWindow(q.from, q.to);
  const key = `pipeline|${q.companyId}|${range.from}|${range.to}|${new Date().toISOString().slice(0, 13)}`;
  const cached = cacheGet<PipelineResponse>(key);
  if (cached) return cached;

  const [opps, lanes] = await Promise.all([
    pgrstGetAllPaginated<OppRaw>(
      `/Oportunidades?companyId=eq.${q.companyId}&createdAt=gte.${startIso}&createdAt=lt.${endIso}&select=id,name,etapadofunil,produto,fonte,campanha,valor,userId,createdAt,contactId,ticketId&order=createdAt.desc`,
      1000,
      4,
    ).then((r) => r.data),
    pgrstGet<Array<{ id: number; name: string; order: number; isActive: boolean }>>(
      `/PipelineLanes?companyId=eq.${q.companyId}&select=id,name,order,isActive&order=order.asc,name.asc`,
    ).then((r) => r.data),
  ]);

  // Oportunidades enriquecidas
  const oportunidades: Oportunidade[] = opps.map((o) => ({
    ...o,
    valorParsed: parseValor(o.valor),
  }));

  // Por etapa do funil (etapadofunil é texto livre)
  const stageMap = new Map<string, { count: number; valorTotal: number }>();
  for (const o of oportunidades) {
    const k = (o.etapadofunil || "(sem etapa)").trim() || "(sem etapa)";
    const cur = stageMap.get(k) ?? { count: 0, valorTotal: 0 };
    cur.count++;
    if (o.valorParsed != null) cur.valorTotal += o.valorParsed;
    stageMap.set(k, cur);
  }
  const total = oportunidades.length;
  const porEtapa: StageStats[] = [...stageMap.entries()]
    .map(([name, s]) => ({
      name,
      count: s.count,
      valorTotal: s.valorTotal,
      pctOfTotal: total > 0 ? s.count / total : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Por fonte
  const fonteMap = new Map<string, number>();
  for (const o of oportunidades) {
    const k = (o.fonte || "(sem fonte)").trim() || "(sem fonte)";
    fonteMap.set(k, (fonteMap.get(k) ?? 0) + 1);
  }
  const byFonte = [...fonteMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Lanes cadastradas (consolida duplicados por nome)
  const lanesByName = new Map<string, number[]>();
  for (const l of lanes) {
    if (!l.isActive) continue;
    const arr = lanesByName.get(l.name) ?? [];
    arr.push(l.id);
    lanesByName.set(l.name, arr);
  }
  const lanesCadastradas = [...lanesByName.entries()]
    .map(([name, ids]) => ({ name, ids }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Diagnóstico de inconsistência
  const etapasUsadas = new Set([...stageMap.keys()].map((s) => s.toLowerCase()));
  const lanesCadastradasSet = new Set([...lanesByName.keys()].map((s) => s.toLowerCase()));
  const etapasUsadasNaoCadastradas = [...stageMap.keys()].filter(
    (s) => !lanesCadastradasSet.has(s.toLowerCase()) && s !== "(sem etapa)",
  );
  const lanesCadastradasNaoUsadas = [...lanesByName.keys()].filter(
    (s) => !etapasUsadas.has(s.toLowerCase()),
  );
  const valoresSemParse = oportunidades.filter(
    (o) => o.valor && o.valor.trim() && o.valorParsed == null,
  ).length;

  const valorTotal = oportunidades.reduce((a, o) => a + (o.valorParsed ?? 0), 0);

  const result: PipelineResponse = {
    range,
    total,
    valorTotal,
    porEtapa,
    byFonte,
    lanesCadastradas,
    oportunidades,
    diagnostico: {
      etapasUsadasNaoCadastradas,
      lanesCadastradasNaoUsadas,
      valoresSemParse,
    },
  };

  cacheSet(key, result, TTL_MS);
  return result;
}
