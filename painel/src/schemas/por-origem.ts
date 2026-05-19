import { z } from "zod";

export const porOrigemQuerySchema = z.object({
  companyId: z.coerce.number().int().positive(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  medicoTagId: z.coerce.number().int().positive().optional(),
  uf: z.string().length(2).optional(),
  tipo: z.string().optional(),
  bucket: z.enum(["all", "with_medico", "without_medico", "with_crm"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(10).max(500).default(50),
});

export type PorOrigemQuery = z.infer<typeof porOrigemQuerySchema>;

export const porOrigemRowSchema = z.object({
  contactId: z.number(),
  name: z.string().nullable(),
  number: z.string().nullable(),
  createdAt: z.string(),
  tags_crm: z.array(z.string()),
  medicos: z.array(z.string()),
});

export type PorOrigemRow = z.infer<typeof porOrigemRowSchema>;

export type PorOrigemResponse = {
  rows: PorOrigemRow[];
  total: number;
  page: number;
  pageSize: number;
  summary: {
    totalContatos: number;
    comMedico: number;
    comCRM: number;
    semClassificacao: number;
    topMedicos: { nome: string; total: number }[];
    topCRM: { nome: string; total: number }[];
  };
};
