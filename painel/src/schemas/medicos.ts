import { z } from "zod";

export const medicoSchema = z.object({
  id: z.number(),
  tagId: z.number(),
  nome: z.string(),
  number: z.string().nullable().optional(),
  tagufid: z.number().nullable().optional(),
  uf: z.string().nullable().optional(),
  tipo: z.string().nullable().optional(),
  ativo: z.boolean().nullable().optional(),
  chatAtivo: z.boolean().nullable().optional(),
  tokenChat: z.string().nullable().optional(),
  tagGold: z.unknown().nullable().optional(),
  filaChat: z.unknown().nullable().optional(),
});

export type Medico = z.infer<typeof medicoSchema>;

export const medicoListSchema = z.array(medicoSchema);
