# Progresso — Painel de Relatórios (Chat/CRM)

Documento de referência sobre o que foi construído, decisões tomadas e
estado atual do projeto.

**Última atualização:** 2026-05-18

---

## Contexto do projeto

- **Banco**: PostgREST em `https://postrestchat.todo-tips.com` (HS256 JWT, role configurado em `.env`).
- **Escopo da Sprint 1**: relatório "Por Origem" da empresa **CLIENTE_X LTDA (companyId=20)**, que tem operação **100% IA** (não há atribuição de `userId` em Tickets).
- **API externa de médicos**: `https://reportapi.todo-tips.com/api/lista_medicos` — retorna 67 médicos com `tagId` (ponte com `Tags.id` no chat DB) + `nome` autoritativo.
- **Iframe params** recebidos via querystring: `companyId`, `backendURL`, `user_LoggedName`, `user_LoggedLevel` (admin/super/user).

---

## Stack final

- Next.js 15 (App Router, standalone)
- Tailwind + shadcn-style primitives (Button, Card, Input, Select, Table, Badge)
- TanStack Query + TanStack Table
- Recharts, date-fns, xlsx, zod
- Lucide icons
- BFF próprio em Route Handlers (`/api/*`) — assina JWT do PostgREST server-side, secret nunca toca o browser

---

## Sprint 1 — entregue ✅

### Relatório "Por Origem"

Replica fielmente a regra da SQL original do usuário:
- `medicos` = tags cujo `id ∈ medic_set` (qualquer `tagType`) → **nome do endpoint**
- `tags_crm` = tags com `tagType='CRM'` e que NÃO estão no medic_set → nome do banco

Funcionalidades:
- Filtros: período, médico (dedup por tagId), UF, tipo, recorte (todos / com-médico / sem-médico / com-CRM)
- Cards KPI: total, com médico, com CRM, sem classificação
- Top 10 médicos por volume + Top 10 tags CRM
- Tabela paginada (50/página) com badges visuais
- Export Excel (xlsx) e CSV (com BOM pt-BR)
- Botão "refresh médicos" — invalida cache da lista de médicos

### Decisões importantes da Sprint 1

1. **Médicos com mesmo `tagId`**: a API retorna 67 médicos mas só 65 `tagId` únicos (Dra. Adriana Lemos atende BH+Betim com mesmo tagId 220; Dra. Analia Vieira em FOZ+Paraguai com tagId 222). Solução: `displayByTagId` combina os nomes com `" / "` ("Dra. Adriana Lemos - Belo Horizonte / Dra. Adriana Lemos - Betim").
2. **Filtro de médico em 2 etapas**: filtros embedados do PostgREST (`Tickets.TicketTags.tagId=eq.X`) só esvaziam o array embedado mas NÃO filtram o pai. Solução: primeira chamada descobre `contactIds` que têm a tag (`/Tickets?TicketTags!inner(tagId)&TicketTags.tagId=eq.X`), segunda chamada busca os contatos completos via `id=in.(...)`. Assim preserva todas as outras tags do contato.

### Otimizações de performance aplicadas

| Cenário | Antes | Depois |
|---|---|---|
| Filtro médico, 16 meses, cold | ~75 s | **4,2 s** (18× mais rápido) |
| Filtro médico, 16 meses, warm cache | — | **13 ms** |
| Sem filtro, 16 meses (29k contatos), cold | — | **28 s** |
| Sem filtro, 16 meses, warm | — | **21 ms** |

Como:
- **Paralelismo no PostgREST** (`pgrstGetAllPaginated`) — 1ª chamada descobre total, demais páginas em paralelo (concurrency=6).
- **Select enxuto** — removeu `Tickets.id` não usado.
- **Cache de resposta no BFF** (TTL 5 min, chave = combinação de filtros).
- **Accept-Encoding gzip/br** explícito nos headers.
- **Logs de timing** no servidor: `ids=Xms fetch=Yms map=Zms total=Tms` por requisição.

### Achados operacionais (companyId=20, CLIENTE_X)

- **5 de 6 WhatsApps DOWN** — só id=189 está CONNECTED; id=166 em qrcode; 4 DISCONNECTED.
- **`Tickets.userId` 100% nulo** (90d) — confirma operação 100% IA.
- **`TicketTraking.nps` zerado** — pesquisa de satisfação não está sendo enviada.
- **`fromAds=24` (default)** em 100% dos registros — sem rastreio de origem de anúncios.
- **1 oportunidade em 90 dias** (24 PipelineLanes ativas) — módulo de pipeline subutilizado.
- **88% das mensagens são `fromMe`**, 86% com `read=false` — padrão de broadcast/automação.

---

## Estrutura do projeto

```
/var/lib/report_chat/painel/
├── .env, .env.example, .gitignore, .dockerignore
├── Dockerfile, docker-compose.yml
├── next.config.ts, tailwind.config.ts, tsconfig.json, postcss.config.mjs
├── package.json (com lock)
├── bin/cloudflared             # binário para túnel
├── PROGRESSO_SPRINTS.md         # este arquivo
├── README.md
└── src/
    ├── middleware.ts            # Basic Auth (ativado em ambientes públicos)
    ├── app/
    │   ├── layout.tsx, providers.tsx, globals.css
    │   ├── page.tsx             # Home (placeholder na Sprint 1, KPIs na Sprint 2)
    │   ├── por-origem/page.tsx  # ✅ implementado
    │   ├── atendimento/page.tsx # placeholder
    │   ├── conexoes/page.tsx    # placeholder (Sprint 2)
    │   ├── pipeline/page.tsx    # placeholder
    │   └── api/
    │       ├── health/route.ts
    │       ├── medicos/route.ts
    │       ├── medicos/refresh/route.ts
    │       ├── por-origem/route.ts
    │       └── por-origem/export/route.ts
    ├── lib/
    │   ├── env.ts               # validação Zod das envs
    │   ├── jwt.ts               # assinatura HS256 do PGRST_JWT_SECRET
    │   ├── pgrst.ts             # cliente PostgREST (paginação paralela)
    │   ├── cache.ts             # TTL store em memória
    │   ├── medicos.ts           # fetch + index tagId→medico
    │   ├── iframe-params.ts     # parse Zod dos 4 params
    │   ├── por-origem.ts        # núcleo do relatório
    │   ├── format.ts            # fmtDateTime, fmtNumber, fmtPhone, fmtPercent
    │   └── utils.ts             # cn helper
    ├── schemas/
    │   ├── medicos.ts
    │   └── por-origem.ts
    └── components/
        ├── app-shell.tsx
        ├── iframe-context.tsx
        ├── kpi-card.tsx
        ├── date-range-picker.tsx
        ├── ui/                  # Button, Card, Input, Select, Table, Badge
        └── por-origem/
            ├── filters.tsx
            ├── summary-cards.tsx
            └── data-table.tsx
```

---

## Variáveis de ambiente

`.env` (gitignored, modo 600):

```
PGRST_BASE_URL=https://postrestchat.todo-tips.com
PGRST_JWT_SECRET=<secret>
PGRST_ROLE=<role>
MEDICOS_API_URL=https://reportapi.todo-tips.com/api/lista_medicos
MEDICOS_CACHE_TTL_HOURS=24
ALLOWED_IFRAME_ORIGINS=https://app.chatmasterveloz.com,https://app2.chatmasterveloz.com
BASIC_AUTH_USER=paulo
BASIC_AUTH_PASS=<gerado aleatório>
NODE_ENV=development
PORT=3000
```

Secrets do PostgREST estão em `/var/lib/report_chat/.pgrst.env`.

---

## Como rodar

```bash
cd /var/lib/report_chat/painel
npm install     # se ainda não instalou
npm run dev     # dev em http://localhost:3000

# OU produção
docker compose up -d --build
```

Acesso autenticado:
```
http://localhost:3000/por-origem?companyId=20&user_LoggedLevel=admin&user_LoggedName=Paulo
```

Login Basic Auth: `paulo` / senha em `.env`.

### Túnel público para testes

```bash
./bin/cloudflared tunnel --url http://localhost:3000 --no-autoupdate
```

URL atual ativa (efêmera, muda em cada execução):
`https://perception-techno-hold-agreements.trycloudflare.com`

---

## Sprint 2 — em construção

### Objetivos
- **Home**: KPIs gerais (volume, TMA, TME, conexões ativas, mensagens perdidas), gráfico de volume diário, heatmap dia×hora.
- **Conexões**: lista de WhatsApps com status, bateria, volume por janela, TMA por conexão, mensagens perdidas.

### Diferenciação por `user_LoggedLevel`
- `admin`/`super`: vê tudo
- `user`: vê só agregados, sem drill-down sensível

---

## Sprint 3 — planejada

- **Atendimento (modo IA)** — KPIs específicos de automação para co=20
- **Pipeline comercial** — funil por estágio, conversão, valor acumulado, fontes

---

## Pontos abertos para evoluir depois

- TPR (tempo de 1ª resposta) — exige join com Messages, custo alto. Vou avaliar se compensa via RPC server-side.
- ROI por campanha — `fromAds`/`Oportunidades.fonte` estão zerados; sem dado, fora do escopo enquanto isso.
- NPS — `TicketTraking.nps` zerado, fora do escopo até a coleta ser ativada.
- Multi-tenant SaaS (visão consolidada de todas as empresas) — depende de demanda.
- Função RPC no Postgres para acelerar o cenário "sem filtro, janela ampla" (hoje ~28s).
