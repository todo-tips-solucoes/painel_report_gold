import { pgrstGet, pgrstGetAllPaginated } from "./pgrst";
import { cacheGet, cacheSet } from "./cache";
import { brtDaysAgoStart } from "./brt";
import type { ConexoesQuery, ConexoesResponse, ConexaoRow } from "@/schemas/conexoes";

const TTL_MS = 5 * 60_000;

type Whatsapp = {
  id: number;
  name: string | null;
  number: string | null;
  status: string | null;
  isDefault: boolean;
  removido: boolean;
  battery: string | null;
  plugged: boolean | null;
  channel: string | null;
  updatedAt: string | null;
};

async function count(path: string): Promise<number> {
  const r = await pgrstGet<unknown[]>(path, {
    countExact: true,
    range: { from: 0, to: 0 },
  });
  return r.total ?? 0;
}

const isoStart = (daysAgo: number) => brtDaysAgoStart(daysAgo);

export async function fetchConexoes(q: ConexoesQuery): Promise<ConexoesResponse> {
  const key = `conexoes|${q.companyId}|${new Date().toISOString().slice(0, 13)}`;
  const cached = cacheGet<ConexoesResponse>(key);
  if (cached) return cached;

  const t1 = isoStart(1);
  const t7 = isoStart(7);
  const t30 = isoStart(30);

  const wppsRes = await pgrstGet<Whatsapp[]>(
    `/Whatsapps?companyId=eq.${q.companyId}&select=id,name,number,status,isDefault,removido,battery,plugged,channel,updatedAt&order=removido.asc,isDefault.desc,id.asc`,
  );
  const wpps = wppsRes.data;

  // métricas em paralelo
  const rows: ConexaoRow[] = await Promise.all(
    wpps.map(async (w) => {
      const [v24, v7, v30, msgsLost, tmaTrk] = await Promise.all([
        count(`/Tickets?companyId=eq.${q.companyId}&whatsappId=eq.${w.id}&createdAt=gte.${t1}`),
        count(`/Tickets?companyId=eq.${q.companyId}&whatsappId=eq.${w.id}&createdAt=gte.${t7}`),
        count(`/Tickets?companyId=eq.${q.companyId}&whatsappId=eq.${w.id}&createdAt=gte.${t30}`),
        count(`/MessagesLost?companyId=eq.${q.companyId}&whatsappId=eq.${w.id}&createdAt=gte.${t30}`),
        pgrstGetAllPaginated<{ createdAt: string; finishedAt: string }>(
          `/TicketTraking?companyId=eq.${q.companyId}&whatsappId=eq.${w.id}&createdAt=gte.${t30}&finishedAt=not.is.null&select=createdAt,finishedAt`,
          1000,
          4,
        ).then((r) => r.data),
      ]);

      const deltas = tmaTrk
        .map((t) => (new Date(t.finishedAt).getTime() - new Date(t.createdAt).getTime()) / 1000)
        .filter((d) => d > 0 && d < 86400 * 30)
        .sort((a, b) => a - b);
      const median = deltas.length === 0 ? null : deltas[Math.floor(deltas.length / 2)];

      return {
        id: w.id,
        name: w.name,
        number: w.number,
        status: w.status,
        isDefault: w.isDefault,
        removido: w.removido,
        battery: w.battery,
        plugged: w.plugged,
        channel: w.channel,
        updatedAt: w.updatedAt,
        volume24h: v24,
        volume7d: v7,
        volume30d: v30,
        tmaMedianSec: median,
        messagesLost30d: msgsLost,
      };
    }),
  );

  const relevant = rows.filter((r) => !r.removido);
  const summary = {
    total: rows.length,
    totalRelevant: relevant.length,
    activeRelevant: relevant.filter((r) => r.status === "CONNECTED").length,
    sumVolume30d: rows.reduce((a, r) => a + r.volume30d, 0),
  };

  const result: ConexoesResponse = { rows, summary };
  cacheSet(key, result, TTL_MS);
  return result;
}
