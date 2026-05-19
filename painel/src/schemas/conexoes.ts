import { z } from "zod";

export const conexoesQuerySchema = z.object({
  companyId: z.coerce.number().int().positive(),
});

export type ConexoesQuery = z.infer<typeof conexoesQuerySchema>;

export type ConexaoRow = {
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
  volume24h: number;
  volume7d: number;
  volume30d: number;
  tmaMedianSec: number | null;
  messagesLost30d: number;
};

export type ConexoesResponse = {
  rows: ConexaoRow[];
  summary: {
    total: number;
    activeRelevant: number;
    totalRelevant: number;
    sumVolume30d: number;
  };
};
