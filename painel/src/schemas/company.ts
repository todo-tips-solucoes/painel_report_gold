import { z } from "zod";

export const companyQuerySchema = z.object({
  companyId: z.coerce.number().int().positive(),
});

export type CompanyQuery = z.infer<typeof companyQuerySchema>;

export type Company = {
  id: number;
  name: string;
  namecomplete: string | null;
};
