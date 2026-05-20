import { pgrstGet, pgrstGetAllPaginated } from "./pgrst";
import { cacheGet, cacheSet } from "./cache";
import {
  brtDaysAgoStart,
  brtLastNDays,
  brtPartsFromUtc,
  brtToday,
  brtStartOfDay,
  brtEndOfDayExclusive,
} from "./brt";
import { rangeLastNDays } from "./date-presets";
import type { HomeQuery, HomeResponse } from "@/schemas/home";

const TTL_MS = 5 * 60_000;

/**
 * Resolve from/to opcionais para uma janela ISO UTC. Default 30 dias.
 * Esta janela só é usada para volumeDaily e heatmap.
 */
function resolveChartWindow(
  from?: string,
  to?: string,
): {
  range: { from: string; to: string };
  startIso: string;
  endIso: string;
  days: string[];
} {
  const today = brtToday();
  const defaults = rangeLastNDays(30);
  const f = from ?? defaults.from;
  const t = to ?? today;
  const days: string[] = [];
  const start = new Date(brtStartOfDay(f));
  const end = new Date(brtStartOfDay(t));
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    days.push(d.toISOString().slice(0, 10));
  }
  return {
    range: { from: f, to: t },
    startIso: brtStartOfDay(f),
    endIso: brtEndOfDayExclusive(t),
    days,
  };
}

async function count(path: string): Promise<number> {
  const r = await pgrstGet<unknown[]>(path, {
    countExact: true,
    range: { from: 0, to: 0 },
  });
  return r.total ?? 0;
}

const isoStart = (daysAgo: number) => brtDaysAgoStart(daysAgo);
const todayStart = () => brtDaysAgoStart(0);

export async function fetchHomeKpis(q: HomeQuery): Promise<HomeResponse> {
  const chartWindow = resolveChartWindow(q.from, q.to);
  const key = `home|${q.companyId}|${chartWindow.range.from}|${chartWindow.range.to}|${brtToday()}`;
  const cached = cacheGet<HomeResponse>(key);
  if (cached) return cached;

  const today = todayStart();
  const t7 = isoStart(7);
  const t30 = isoStart(30);
  // (volumeDaily e heatmap usam chartWindow em vez das janelas fixas acima)

  const [
    ticketsToday,
    tickets7d,
    tickets30d,
    msgsLost30d,
    wpps,
    tmaSample,
    ackSample,
    ticketsForVolume,
  ] = await Promise.all([
    count(`/Tickets?companyId=eq.${q.companyId}&createdAt=gte.${today}`),
    count(`/Tickets?companyId=eq.${q.companyId}&createdAt=gte.${t7}`),
    count(`/Tickets?companyId=eq.${q.companyId}&createdAt=gte.${t30}`),
    count(`/MessagesLost?companyId=eq.${q.companyId}&createdAt=gte.${t30}`),
    pgrstGet<Array<{ id: number; name: string | null; status: string | null; removido: boolean }>>(
      `/Whatsapps?companyId=eq.${q.companyId}&select=id,name,status,removido`,
    ).then((r) => r.data),
    pgrstGetAllPaginated<{ createdAt: string; finishedAt: string }>(
      `/TicketTraking?companyId=eq.${q.companyId}&createdAt=gte.${t30}&finishedAt=not.is.null&select=createdAt,finishedAt`,
      1000,
      6,
    ).then((r) => r.data),
    pgrstGetAllPaginated<{ ack: number; fromMe: boolean }>(
      `/Messages?companyId=eq.${q.companyId}&createdAt=gte.${t30}&fromMe=is.true&select=ack,fromMe`,
      1000,
      6,
    ).then((r) => r.data),
    pgrstGetAllPaginated<{ createdAt: string }>(
      `/Tickets?companyId=eq.${q.companyId}&createdAt=gte.${chartWindow.startIso}&createdAt=lt.${chartWindow.endIso}&select=createdAt`,
      1000,
      6,
    ).then((r) => r.data),
  ]);

  // TMA
  const deltas = tmaSample
    .map((t) => (new Date(t.finishedAt).getTime() - new Date(t.createdAt).getTime()) / 1000)
    .filter((d) => d > 0 && d < 86400 * 30)
    .sort((a, b) => a - b);
  const median =
    deltas.length === 0 ? null : deltas[Math.floor(deltas.length / 2)];
  const p90 =
    deltas.length === 0 ? null : deltas[Math.floor(deltas.length * 0.9)];

  // Delivery
  let totalSent = 0;
  let delivered = 0;
  let read = 0;
  for (const m of ackSample) {
    if (!m.fromMe) continue;
    totalSent++;
    if (m.ack >= 3) delivered++;
    if (m.ack === 4) read++;
  }

  // Conexões
  const activeWpps = wpps.filter((w) => w.status === "CONNECTED" && !w.removido);
  const totalRelevant = wpps.filter((w) => !w.removido).length;

  // Volume diário na janela do filtro — agregado por dia BRT
  const dayMap = new Map<string, number>();
  for (const day of chartWindow.days) dayMap.set(day, 0);
  for (const t of ticketsForVolume) {
    const day = brtPartsFromUtc(t.createdAt).date;
    if (dayMap.has(day)) dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }
  const volumeDaily = [...dayMap.entries()].map(([day, total]) => ({ day, total }));

  // Heatmap dia × hora na janela do filtro (weekday/hour em BRT)
  const heatBuckets = new Map<string, number>();
  for (const t of ticketsForVolume) {
    const { weekday, hour } = brtPartsFromUtc(t.createdAt);
    const key = `${weekday}|${hour}`;
    heatBuckets.set(key, (heatBuckets.get(key) ?? 0) + 1);
  }
  const heatmap: Array<{ weekday: number; hour: number; total: number }> = [];
  for (let w = 0; w < 7; w++) {
    for (let h = 0; h < 24; h++) {
      heatmap.push({ weekday: w, hour: h, total: heatBuckets.get(`${w}|${h}`) ?? 0 });
    }
  }

  const result: HomeResponse = {
    range: chartWindow.range,
    tickets: { today: ticketsToday, last7d: tickets7d, last30d: tickets30d },
    tma: { medianSec: median, p90Sec: p90, sampleSize: deltas.length },
    delivery: {
      rateAck3plus: totalSent > 0 ? delivered / totalSent : 0,
      rateAck4: totalSent > 0 ? read / totalSent : 0,
      sampleSize: totalSent,
    },
    conexoes: {
      active: activeWpps.length,
      total: totalRelevant,
      activeNames: activeWpps.map((w) => w.name ?? `#${w.id}`),
    },
    messagesLost30d: msgsLost30d,
    volumeDaily,
    heatmap,
  };

  cacheSet(key, result, TTL_MS);
  return result;
}
