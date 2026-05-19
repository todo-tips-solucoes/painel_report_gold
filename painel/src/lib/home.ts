import { pgrstGet, pgrstGetAllPaginated } from "./pgrst";
import { cacheGet, cacheSet } from "./cache";
import { brtDaysAgoStart, brtLastNDays, brtPartsFromUtc, brtToday } from "./brt";
import type { HomeQuery, HomeResponse } from "@/schemas/home";

const TTL_MS = 5 * 60_000;

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
  const key = `home|${q.companyId}|${brtToday()}`;
  const cached = cacheGet<HomeResponse>(key);
  if (cached) return cached;

  const today = todayStart();
  const t7 = isoStart(7);
  const t30 = isoStart(30);
  const t28 = isoStart(28);

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
      `/Tickets?companyId=eq.${q.companyId}&createdAt=gte.${t30}&select=createdAt`,
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

  // Volume diário (últimos 30d) — agregado por dia BRT
  const dayMap = new Map<string, number>();
  for (const day of brtLastNDays(30)) dayMap.set(day, 0);
  for (const t of ticketsForVolume) {
    const day = brtPartsFromUtc(t.createdAt).date;
    if (dayMap.has(day)) dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }
  const volumeDaily = [...dayMap.entries()].map(([day, total]) => ({ day, total }));

  // Heatmap dia × hora (últimos 28 dias BRT, weekday/hour em BRT)
  const t28Start = new Date(t28).getTime();
  const heatBuckets = new Map<string, number>();
  for (const t of ticketsForVolume) {
    const ts = new Date(t.createdAt).getTime();
    if (ts < t28Start) continue;
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
