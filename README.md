# Painel de Relatórios

> Painel embedável via iframe para visualização de relatórios do chat/CRM multi-tenant. Cinco rotas (Home, Por Origem, Atendimento, Conexões, Pipeline) sobre um BFF próprio que assina JWT do PostgREST server-side.

**Repositório:** https://github.com/todo-tips-solucoes/painel_report_gold

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?logo=typescript&logoColor=white)](painel/tsconfig.json)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)](painel/package.json)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss&logoColor=white)](painel/tailwind.config.ts)

## Estrutura do repositório

```
.
├── painel/                  # Next.js 15 app (código deployável)
├── PRODUCT.md               # Estratégia de produto e princípios de design
├── DESIGN.md                # Design system (Stitch-compliant)
├── CLAUDE.md                # Guia para sessões de Claude Code
├── .impeccable/             # Sidecar do design system + snapshots de critique
└── schemas_tabelas_chat/    # Schemas SQL do banco PostgREST (documentação)
```

## Quick start

```bash
cd painel
cp .env.example .env   # preencher PGRST_JWT_SECRET, BASIC_AUTH_PASS, etc
npm install
npm run dev
```

Acesse `http://localhost:3000/?companyId=20`. Mais detalhes em [painel/README.md](painel/README.md).

## Documentação

| Arquivo | Para que serve |
|---|---|
| [painel/README.md](painel/README.md) | Setup do app, env vars, parâmetros de iframe |
| [CLAUDE.md](CLAUDE.md) | Arquitetura, BFF pattern, convenções para futuras sessões de Claude Code |
| [PRODUCT.md](PRODUCT.md) | Quem usa, anti-referências, princípios estratégicos |
| [DESIGN.md](DESIGN.md) | Tokens (cores, tipografia, components), Named Rules, do's & don'ts |
| [painel/PROGRESSO_SPRINTS.md](painel/PROGRESSO_SPRINTS.md) | Histórico das sprints + decisões importantes |

## Stack

- **Next.js 15** (App Router, standalone output) + **React 19**
- **Tailwind 3** + primitivos shadcn-style
- **TanStack Query** (cache cliente) + **TanStack Table**
- **Recharts** (charts), **date-fns**, **xlsx**, **zod**
- **PostgREST** como backend (chat/CRM Postgres) — JWT HS256 assinado pelo BFF
- API externa de médicos com cache de 24h

## Deploy

```bash
cd painel
docker compose up -d --build
```

## Licença

Privado / interno.
