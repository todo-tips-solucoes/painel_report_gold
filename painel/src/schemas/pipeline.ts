import { z } from "zod";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const pipelineQuerySchema = z.object({
  companyId: z.coerce.number().int().positive(),
  from: z.string().regex(ISO_DATE).optional(),
  to: z.string().regex(ISO_DATE).optional(),
});

export type PipelineQuery = z.infer<typeof pipelineQuerySchema>;

export type StageStats = {
  name: string;
  count: number;
  valorTotal: number;
  pctOfTotal: number;
};

export type Oportunidade = {
  id: number;
  name: string | null;
  etapadofunil: string | null;
  produto: string | null;
  fonte: string | null;
  campanha: string | null;
  valor: string | null;
  valorParsed: number | null;
  userId: number | null;
  createdAt: string;
  contactId: number;
  ticketId: number;
};

export type PipelineResponse = {
  range: { from: string; to: string };
  total: number;
  valorTotal: number;
  porEtapa: StageStats[];
  byFonte: { name: string; count: number }[];
  lanesCadastradas: { name: string; ids: number[] }[];
  oportunidades: Oportunidade[];
  diagnostico: {
    etapasUsadasNaoCadastradas: string[];
    lanesCadastradasNaoUsadas: string[];
    valoresSemParse: number;
  };
};
