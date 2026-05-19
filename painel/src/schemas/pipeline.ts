import { z } from "zod";

export const pipelineQuerySchema = z.object({
  companyId: z.coerce.number().int().positive(),
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
