# Painel Relatórios — Chat / CRM

Painel embedável (iframe) para visualização de relatórios sobre o banco de chat
multi-tenant, com lente sobre uma empresa por vez.

**Repositório:** https://github.com/todo-tips-solucoes/painel_report_gold

Veja também o [README na raiz](../README.md) com a visão geral do projeto.

## Stack

- Next.js 15 (App Router, standalone output)
- Tailwind + shadcn-style components
- TanStack Query + TanStack Table
- Recharts, date-fns, xlsx, zod

## Parâmetros de iframe (querystring)

```
?companyId=20
&backendURL=https://...
&user_LoggedName=Fulano
&user_LoggedLevel=admin
```

`user_LoggedLevel` controla permissões:

- `admin` / `super`: vê tudo
- `user`: vê só agregados (sem drill-down por operador)

## Variáveis de ambiente

Veja `.env.example`. Copie para `.env` antes de subir.

## Desenvolvimento

```bash
npm install
npm run dev
```

Acesse: `http://localhost:3000/por-origem?companyId=20&user_LoggedLevel=admin`

## Deploy (Docker)

```bash
docker compose up -d --build
```

## Atualizar cache de médicos (24h por padrão)

```bash
curl -X POST http://localhost:3000/api/medicos/refresh
```

## Estrutura

- `src/app/api/*` — BFF (assina JWT do PostgREST server-side)
- `src/app/(routes)/*` — páginas
- `src/lib/*` — helpers (jwt, pgrst, cache, médicos)
- `src/components/*` — UI
