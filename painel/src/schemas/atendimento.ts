import { z } from "zod";

export const atendimentoQuerySchema = z.object({
  companyId: z.coerce.number().int().positive(),
});

export type AtendimentoQuery = z.infer<typeof atendimentoQuerySchema>;

export type FilaStats = {
  queueId: number | null;
  name: string;
  total: number;
  closed: number;
  pending: number;
  pctOfTotal: number;
};

export type AtendimentoResponse = {
  mode: "ia" | "humano";
  iaAttribution: { totalTickets: number; withUser: number; pct: number };
  tickets30d: { total: number; closed: number; pending: number };
  tprSample: { medianSec: number | null; p90Sec: number | null; n: number };
  filas: FilaStats[];
  semFila: { total: number; pct: number };
  escalonamento: {
    totalWithTraking: number;
    semEscalonamento: number;
    comEscalonamento: number;
    pctEscalonamento: number;
  };
  conversao: {
    closedRate: number;
    pendingOlderThan24h: number;
  };
};
