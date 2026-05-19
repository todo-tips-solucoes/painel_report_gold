import { z } from "zod";

const schema = z.object({
  PGRST_BASE_URL: z.string().url(),
  PGRST_JWT_SECRET: z.string().min(8),
  PGRST_ROLE: z.string().min(1),
  MEDICOS_API_URL: z.string().url(),
  MEDICOS_CACHE_TTL_HOURS: z.coerce.number().int().positive().default(24),
  ALLOWED_IFRAME_ORIGINS: z.string().default(""),
});

const parsed = schema.safeParse({
  PGRST_BASE_URL: process.env.PGRST_BASE_URL,
  PGRST_JWT_SECRET: process.env.PGRST_JWT_SECRET,
  PGRST_ROLE: process.env.PGRST_ROLE,
  MEDICOS_API_URL: process.env.MEDICOS_API_URL,
  MEDICOS_CACHE_TTL_HOURS: process.env.MEDICOS_CACHE_TTL_HOURS,
  ALLOWED_IFRAME_ORIGINS: process.env.ALLOWED_IFRAME_ORIGINS,
});

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Missing/invalid environment variables");
}

export const env = parsed.data;
