import { z } from "zod";

const schema = z.object({
  PGRST_BASE_URL: z.string().url(),
  PGRST_JWT_SECRET: z.string().min(8),
  PGRST_ROLE: z.string().min(1),
  MEDICOS_API_URL: z.string().url(),
  MEDICOS_CACHE_TTL_HOURS: z.coerce.number().int().positive().default(24),
  ALLOWED_IFRAME_ORIGINS: z.string().default(""),
});

type Env = z.infer<typeof schema>;

/**
 * Durante `next build` (especialmente em Docker, onde o .env não está
 * disponível por design), o Next coleta page data importando todas as rotas
 * `/api/*`, que cascateiam até este módulo. Pular validação nesse momento
 * permite o build; runtime continua estrito.
 *
 * Set `SKIP_ENV_VALIDATION=1` no stage builder do Dockerfile.
 */
function load(): Env {
  if (process.env.SKIP_ENV_VALIDATION === "1") {
    return {
      PGRST_BASE_URL: "https://invalid.build-time.placeholder",
      PGRST_JWT_SECRET: "build-time-placeholder",
      PGRST_ROLE: "build",
      MEDICOS_API_URL: "https://invalid.build-time.placeholder",
      MEDICOS_CACHE_TTL_HOURS: 24,
      ALLOWED_IFRAME_ORIGINS: "",
    };
  }

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
  return parsed.data;
}

export const env = load();
