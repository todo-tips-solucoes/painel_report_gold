import { pgrstGet, pgrstGetAllPaginated } from "./pgrst";
import { cacheGet, cacheSet } from "./cache";
import {
  brtDaysAgoStart,
  brtStartOfDay,
  brtEndOfDayExclusive,
  brtToday,
} from "./brt";
import { rangeLastNDays } from "./date-presets";
import type { AtendimentoQuery, AtendimentoResponse, FilaStats } from "@/schemas/atendimento";

const TTL_MS = 5 * 60_000;

async function sampleTpr(
  companyId: number,
  windowStart: string,
  windowEnd: string,
): Promise<{ median: number | null; p90: number | null; n: number }> {
  // Sorteia até 80 tickets fechados na janela e mede o tempo entre 1ª msg do cliente e 1ª msg da empresa.
  const tickets = await pgrstGet<Array<{ id: number }>>(
    `/Tickets?companyId=eq.${companyId}&createdAt=gte.${windowStart}&createdAt=lt.${windowEnd}&status=eq.closed&select=id&order=id.desc&limit=80`,
  );
  const deltas: number[] = [];
  await Promise.all(
    tickets.data.map(async (tk) => {
      const r = await pgrstGet<Array<{ createdAt: string; fromMe: boolean }>>(
        `/Messages?companyId=eq.${companyId}&ticketId=eq.${tk.id}&select=createdAt,fromMe&order=createdAt.asc&limit=20`,
      );
      const msgs = r.data;
      const firstClient = msgs.find((m) => !m.fromMe);
      if (!firstClient) return;
      const firstFromUsAfter = msgs.find(
        (m) => m.fromMe && new Date(m.createdAt).getTime() >= new Date(firstClient.createdAt).getTime(),
      );
      if (!firstFromUsAfter) return;
      const dt =
        (new Date(firstFromUsAfter.createdAt).getTime() - new Date(firstClient.createdAt).getTime()) / 1000;
      if (dt >= 0 && dt < 86400) deltas.push(dt);
    }),
  );
  deltas.sort((a, b) => a - b);
  return {
    median: deltas.length ? deltas[Math.floor(deltas.length / 2)] : null,
    p90: deltas.length ? deltas[Math.floor(deltas.length * 0.9)] : null,
    n: deltas.length,
  };
}

/**
 * Resolve `from`/`to` opcionais para uma janela `[start, end)` em ISO UTC.
 * Default quando ambos ausentes: últimos 30 dias (compatível com comportamento anterior).
 */
function resolveWindow(
  from?: string,
  to?: string,
): { range: { from: string; to: string }; startIso: string; endIso: string } {
  const today = brtToday();
  const defaultRange = rangeLastNDays(30);
  const f = from ?? defaultRange.from;
  const t = to ?? today;
  return {
    range: { from: f, to: t },
    startIso: brtStartOfDay(f),
    endIso: brtEndOfDayExclusive(t),
  };
}

export async function fetchAtendimento(q: AtendimentoQuery): Promise<AtendimentoResponse> {
  const { range, startIso, endIso } = resolveWindow(q.from, q.to);
  const key = `atendimento|${q.companyId}|${range.from}|${range.to}|${new Date().toISOString().slice(0, 13)}`;
  const cached = cacheGet<AtendimentoResponse>(key);
  if (cached) return cached;

  // "Pending > 24h" é sempre relativo a agora (snapshot operacional), independe da janela.
  const t1 = brtDaysAgoStart(1);

  const [allTicketsRaw, queuesRaw, withUserCount, trakingRaw, pendingOld] = await Promise.all([
    pgrstGetAllPaginated<{ queueId: number | null; status: string; userId: number | null }>(
      `/Tickets?companyId=eq.${q.companyId}&createdAt=gte.${startIso}&createdAt=lt.${endIso}&select=queueId,status,userId`,
      1000,
      6,
    ).then((r) => r.data),
    pgrstGet<Array<{ id: number; name: string }>>(
      `/Queues?companyId=eq.${q.companyId}&select=id,name`,
    ).then((r) => r.data),
    pgrstGet<unknown[]>(
      `/Tickets?companyId=eq.${q.companyId}&createdAt=gte.${startIso}&createdAt=lt.${endIso}&userId=not.is.null`,
      { countExact: true, range: { from: 0, to: 0 } },
    ).then((r) => r.total ?? 0),
    pgrstGetAllPaginated<{ nextQueuesIds: unknown; queuesIds: string | null }>(
      `/TicketTraking?companyId=eq.${q.companyId}&createdAt=gte.${startIso}&createdAt=lt.${endIso}&select=queuesIds,nextQueuesIds`,
      1000,
      6,
    ).then((r) => r.data),
    pgrstGet<unknown[]>(
      `/Tickets?companyId=eq.${q.companyId}&status=eq.pending&createdAt=lt.${t1}`,
      { countExact: true, range: { from: 0, to: 0 } },
    ).then((r) => r.total ?? 0),
  ]);

  // Distribuição por fila
  const queueNameById = new Map<number, string>();
  for (const queue of queuesRaw) queueNameById.set(queue.id, queue.name);

  const ticketsByQueue = new Map<number | null, { total: number; closed: number; pending: number }>();
  let total = 0;
  let closed = 0;
  let pending = 0;
  for (const t of allTicketsRaw) {
    total++;
    if (t.status === "closed") closed++;
    else if (t.status === "pending") pending++;
    const entry = ticketsByQueue.get(t.queueId) ?? { total: 0, closed: 0, pending: 0 };
    entry.total++;
    if (t.status === "closed") entry.closed++;
    if (t.status === "pending") entry.pending++;
    ticketsByQueue.set(t.queueId, entry);
  }

  const filas: FilaStats[] = [];
  let semFilaTotal = 0;
  for (const [queueId, stats] of ticketsByQueue.entries()) {
    if (queueId == null) {
      semFilaTotal = stats.total;
      continue;
    }
    filas.push({
      queueId,
      name: queueNameById.get(queueId) ?? `#${queueId}`,
      total: stats.total,
      closed: stats.closed,
      pending: stats.pending,
      pctOfTotal: total > 0 ? stats.total / total : 0,
    });
  }
  filas.sort((a, b) => b.total - a.total);

  // Escalonamento (transferência entre filas)
  let comEscalonamento = 0;
  for (const t of trakingRaw) {
    const next = t.nextQueuesIds;
    if (Array.isArray(next) && next.filter((x) => x != null).length > 0) {
      comEscalonamento++;
    }
  }
  const semEscalonamento = trakingRaw.length - comEscalonamento;

  // Modo
  const pctWithUser = total > 0 ? withUserCount / total : 0;
  const mode: "ia" | "humano" = pctWithUser < 0.2 ? "ia" : "humano";

  // TPR sample na janela
  const tpr = await sampleTpr(q.companyId, startIso, endIso);

  const result: AtendimentoResponse = {
    range,
    mode,
    iaAttribution: { totalTickets: total, withUser: withUserCount, pct: pctWithUser },
    ticketsInRange: { total, closed, pending },
    tprSample: { medianSec: tpr.median, p90Sec: tpr.p90, n: tpr.n },
    filas,
    semFila: { total: semFilaTotal, pct: total > 0 ? semFilaTotal / total : 0 },
    escalonamento: {
      totalWithTraking: trakingRaw.length,
      semEscalonamento,
      comEscalonamento,
      pctEscalonamento: trakingRaw.length > 0 ? comEscalonamento / trakingRaw.length : 0,
    },
    conversao: {
      closedRate: total > 0 ? closed / total : 0,
      pendingOlderThan24h: pendingOld,
    },
  };

  cacheSet(key, result, TTL_MS);
  return result;
}
