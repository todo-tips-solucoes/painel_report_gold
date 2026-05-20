import { z } from "zod";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const atendimentoQuerySchema = z.object({
  companyId: z.coerce.number().int().positive(),
  from: z.string().regex(ISO_DATE).optional(),
  to: z.string().regex(ISO_DATE).optional(),
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
  range: { from: string; to: string };
  mode: "ia" | "humano";
  iaAttribution: { totalTickets: number; withUser: number; pct: number };
  ticketsInRange: { total: number; closed: number; pending: number };
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
