# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

The Next.js app lives in `painel/`; most work happens there. `PRODUCT.md` / `DESIGN.md` at the repo root are design-system context (loaded by the `impeccable` skill). `painel/.env` holds BFF secrets (gitignored, mode 600) — `.env.example` is the template.

## Commands

Run from `painel/`. Standard npm scripts (see `package.json`), plus `docker compose up -d --build` for the production deploy.

There is no test framework configured. `typecheck` is the safety net — keep it green on every change.

## High-level architecture

**Painel de Relatórios** is an iframe-embeddable BFF dashboard that reads from a PostgREST endpoint (chat/CRM Postgres) and an external médicos API. The whole product is multi-tenant via query string.

### BFF pattern (critical to grok)

The browser **never** talks to PostgREST directly. All access goes through Next.js Route Handlers in `painel/src/app/api/*`:

1. Page mounts → `useIframeParams()` reads `companyId` from URL.
2. Page calls `fetch("/api/kpis/<route>?companyId=N")` via Tanstack Query.
3. The handler validates query with Zod (`src/schemas/*.ts`), calls a function in `src/lib/<feature>.ts`.
4. That lib function uses `src/lib/pgrst.ts` to query PostgREST.
5. `pgrst.ts` calls `signPgrstJwt()` (HS256 sign of `PGRST_JWT_SECRET`) per request — JWT cached in-process for ~1h.

The JWT secret **never leaves the server**. If you're tempted to fetch PostgREST from a client component, stop — that breaks the security model.

### Multi-tenant via iframe query string

Every page expects `?companyId=N` (Zod-coerced integer). Also accepted: `backendURL`, `user_LoggedName`, `user_LoggedLevel` (`admin` | `super` | `user`). Parsed in `src/components/iframe-context.tsx` → `useIframeParams()`. Invalid params render an error card with field-level Zod messages instead of crashing.

CSP `frame-ancestors` is built at runtime in `src/middleware.ts` (not in `next.config.ts` — `headers()` there runs at build time, when `.env` is dockerignored). Controlled by `ALLOWED_IFRAME_ORIGINS` (comma-separated). Default is `'self'`.

`companyId=20` is the CLIENTE_X operation (100% IA, no human operators in attribution). It's the canonical test tenant.

### Two-layer cache

1. **Server-side TTL cache** (`src/lib/cache.ts`): in-memory store keyed by filter combination. Used for médicos index (24h TTL) and for slow PostgREST aggregations (TTL configurable per call). Cleared on process restart.
2. **Tanstack Query** in the browser: `staleTime: STALE_THRESHOLD_MS` (5 min, exported from `components/freshness-indicator.tsx`). Pages use `useFreshnessClock()` to surface "atualizado às HH:mm" + a refresh button that calls `invalidateQueries`.

### PostgREST patterns

- **Always sign JWT per call site** via `pgrst.ts` helpers. Don't reach into `signPgrstJwt()` directly.
- **Paginate in parallel**: `pgrstGetAllPaginated()` discovers `Content-Range` total on the first request, then fetches remaining pages with `concurrency: 6`. Used for time-window queries that return thousands of rows.
- **Keep `select` lists tight**. Each unused column costs proportionally to the row count.
- **Explicit `Accept-Encoding: gzip, br`** in headers — the helper sets it; don't strip it.
- The lib functions log timing breakdown (`ids=Xms fetch=Yms map=Zms total=Tms`) to stdout. Use these to diagnose slow queries.

### Auth (optional Basic Auth via middleware)

`painel/src/middleware.ts` supports HTTP Basic Auth on all paths except `/api/health` and Next static assets. **Disabled by default** — only activates when **both** `BASIC_AUTH_USER` and `BASIC_AUTH_PASS` are set in the environment. With them unset/commented (current state in production), the middleware is a no-op and the panel is accessible without prompt.

Trade-off accepted: the panel is reachable by anyone who knows the URL. Acceptable because (a) data is internal/operational, not regulated; (b) CSP `frame-ancestors` blocks other sites from embedding the iframe; (c) Basic Auth in iframes provides terrible UX (re-prompts per session/device) without meaningful security against determined attackers.

To re-enable: uncomment the two BASIC_AUTH lines in `painel/.env` and `docker compose up -d`.

## Page / data flow

Each page maps 1:1 to a route handler under `src/app/api/`, a lib in `src/lib/`, and a Zod schema in `src/schemas/` sharing the same name.

Médicos (external API, not PostgREST): `src/lib/medicos.ts` fetches `MEDICOS_API_URL`, indexes by `tagId`, caches 24h. `/api/medicos` returns the cached index; `/api/medicos/refresh` (POST) invalidates and rebuilds. The "Médicos" refresh button in `/por-origem` filters calls this.

**Cron diário (VPS)**: `crontab -e` na VPS tem entrada `0 7 * * *` (4h BRT = 7h UTC) que faz `POST /api/medicos/refresh` e loga em `/var/log/painel-medicos-refresh.log`. Garante que a lista esteja fresca todo dia sem depender de clique manual. Para inspecionar: `tail -5 /var/log/painel-medicos-refresh.log` mostra os últimos refreshes com timestamp + resposta JSON.

## Shared components (use these — don't reinvent)

In `src/components/`:

`freshness-indicator.tsx`, `report-error-state.tsx`, `kpi-card.tsx`, `ui/info-tooltip.tsx`, `ui/badge.tsx`. Read the file before building an equivalent.

`fmtNumber`, `fmtDuration`, `fmtPercent`, `fmtCurrencyBRL`, `fmtDateTime`, `fmtPhone` live in `src/lib/format.ts`. Use them consistently — never call `Intl.NumberFormat` ad-hoc.

## Design conventions (enforced)

PRODUCT.md and DESIGN.md at the repo root encode the design system. Highlights:

- **Register: `product`** — design serves the product. Restrained color: tinted neutrals + one accent ≤10%.
- **One Accent Rule**: `bg-primary` cheio só onde for ação ou pico significativo. Para escalas/tabelas use `bg-foreground/<alpha>` ou `variant="subtle"`.
- **Never** `#fff`, `#000`, or `hsl(0 0% 100%)`. Tailwind `background` token = `hsl(220 33% 99.2%)`. CSS vars `--ds-*` in `globals.css` mirror Tailwind tokens for Recharts/non-Tailwind consumers.
- **No em dash (—) in user copy.** Use period, colon, parenthesis, or `·`. Allowed in code comments and as standalone placeholder for empty cells.
- **No border-left/right > 1px as accent stripes** (absolute ban from the design system).
- **Hierarchy via scale + weight contrast** (ratio ≥1.25 between steps). Pages use a "hero KPI" pattern that picks dynamically based on data state — see `pickHero()` functions in each page for the convention.
- **Glossário (`<details>`)** at the bottom of report pages explains domain terms (Ticket, TMA, p90, etc).

## Operational notes (non-obvious)

- **Server already runs**: `next dev` is persistent on port 3000 (PID is in `ps`). Don't start a second one. Hot reload picks up edits automatically.
- **Tunnel for external testing**: `bin/cloudflared` lives in `painel/bin/`. Quick tunnels (`trycloudflare.com`) work but the URL changes each session. HMR via tunnel sometimes drops the WebSocket — that doesn't block manual reload, just hot-reload.
- **PostgREST credentials**: real values live in `/var/lib/report_chat/.pgrst.env` (outside the painel directory). The painel `.env` references them via env var inheritance in `docker-compose.yml`.
- **`api/por-origem/export/route.ts`**: returns binary (XLSX or CSV) via `Response`. Buffer→ArrayBuffer copy via `toArrayBuffer()` helper is intentional (avoids Node `Buffer<ArrayBufferLike>` vs DOM `BodyInit` TS conflict).
- **Tags CRM in `/por-origem` data-table**: use `<Badge variant="subtle">`, not `primary`. Pages can render 200+ tags per viewport — Telemetry Blue overdose was the dominant pre-redesign anti-pattern. There's an explicit `TagList` cap (`MAX_VISIBLE_TAGS = 4`) with `+N` overflow.

## Useful background

- `PROGRESSO_SPRINTS.md` in `painel/` has the original sprint planning, optimization history (e.g., `pgrstGetAllPaginated` brought a query from 75s → 4.2s), and operational findings about `companyId=20`.
- `painel/README.md` is concise and accurate; treat it as authoritative for iframe params and env vars.
- `.impeccable/critique/*` holds historical design critiques per page (slug-based filenames). Useful to understand why specific design decisions were made.
- `internal/sql/por-origem-reconstruida.sql` (gitignored, local-only) — referência canônica do SELECT que originou a página `/por-origem`. Equivalente em comportamento ao código em `src/lib/por-origem.ts`. Útil quando precisar entender a regra original ou portar a lógica para outro consumidor.
