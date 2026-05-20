import type { NextConfig } from "next";

/**
 * Headers de segurança (Content-Security-Policy com frame-ancestors,
 * X-Content-Type-Options, Referrer-Policy) são aplicados em runtime pelo
 * `src/middleware.ts` — não aqui no next.config.
 *
 * Motivo: `headers()` do next.config é avaliado em BUILD time. No Docker, o
 * `.env` está no `.dockerignore`, então durante `next build`
 * ALLOWED_IFRAME_ORIGINS fica vazio e o CSP ficava 'self' fixo no bundle
 * mesmo com env_file populada em runtime. Migrado para middleware resolve:
 * env é lida a cada request, mudanças no .env só exigem restart do container.
 */
const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
