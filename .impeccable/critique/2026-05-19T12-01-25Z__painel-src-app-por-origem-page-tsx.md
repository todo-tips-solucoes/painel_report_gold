---
target: painel/src/app/por-origem/page.tsx
total_score: 18
p0_count: 2
p1_count: 4
p2_count: 2
timestamp: 2026-05-19T12-01-25Z
slug: painel-src-app-por-origem-page-tsx
---
# Critique: painel/src/app/por-origem/page.tsx ("Relatório por Origem")

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | `isFetching` propaga para filtros, mas zero freshness; sem indicador de filtros ativos; erro silencioso |
| 2 | Match System / Real World | 2 | "Recorte" (jargão BI), "API externa" no subtítulo, "Top 10 por volume" (volume do quê?) |
| 3 | User Control and Freedom | 3 | Filtros completos, export CSV/Excel, refresh médicos. Sem "limpar filtros", sem keyboard |
| 4 | Consistency and Standards | 2 | Summary usa KpiCard. "Top 10" usa Card direto. h1 inconsistente com Home pós-bolder |
| 5 | Error Prevention | 2 | Zod nas APIs. Cliente não valida `from > to`. pageSize máx 500 sem warning. Build error pré-existente em export/route.ts:56 |
| 6 | Recognition Rather Than Recall | 2 | Filtros visíveis. Zero tooltips, zero glossário, sem "Recorte" explicado |
| 7 | Flexibility and Efficiency | 3 | Export, refresh, pagination com input direto. Sem keyboard, sem URL sync |
| 8 | Aesthetic and Minimalist Design | 2 | h1 fraco; 4 KPIs idênticos; 2 cards "Top 10" idênticos; tags como Telemetry Blue criam mancha azul gigante (≈250 badges/página) |
| 9 | Error Recovery | 0 | `isError` do useQuery **completamente ignorado** — falha silenciosa → tabela vazia |
| 10 | Help and Documentation | 0 | Zero tooltips, zero glossário |
| **Total** | | **18/40** | **Médio** (acima da Home pré-bolder em 14, abaixo da Home pós-clarify em 27) |

## Anti-Patterns Verdict

**LLM assessment**: Sim, AI/template SaaS — mesma combinação shadcn-default + grade de cards idênticos. Aqui é **agravado pelo data-table**: as tags CRM são renderizadas como `Badge variant="primary"` (Telemetry Blue tonal), e cada contato tem N tags. Em uma página típica de 50 contatos com média de 5 tags = **~250 manchas azuis tonais visíveis simultaneamente**. Isso é Telemetry Blue overdose em escala dramática — pior que o heatmap original da Home antes do colorize.

Outros tells de AI/template:
- h1 `text-xl font-semibold` (20px) — mesma fraqueza que a Home tinha antes do bolder.
- 4 KpiCards idênticos no SummaryCards (grid 2×4) — "identical card grids".
- 2 cards "Top 10" idênticos lado a lado — mesma armadilha.
- Filters envoltos em `<Card>` — possível excesso de container. PorOrigemFilters não precisa de borda extra.

**Deterministic scan**: `detect.mjs` continua indisponível. Greps manuais relevantes:
- Em dash em copy de usuário: 1 ocorrência no subtítulo (`"...por médico (API externa) e tags CRM."` — sem em dash, ok). En dash `–` em `"{start}–{end} de {total}"` (pagination footer) — convenção tipográfica para range, **aceitável**.
- `"—"` placeholder no data-table quando célula vazia (linhas 124, 137 do data-table.tsx) — convenção visual, aceitável (mesma escolha aplicada na Home).

**Visual overlays**: skipped.

## Overall Impression

Esta é a página com a **maior dissonância** entre função e forma do projeto. Funcionalmente é a mais robusta (filtros, export, pagination, refresh), mas visualmente é a mais cansada (grade chapada + mancha azul tonal do data-table). E ainda **silencia erros**: se o BFF cair, o usuário vê uma tabela vazia como se o filtro não tivesse retornado nada. Pior que a Home antes do `harden`.

Maior alavanca única: **tratar o erro silencioso (P0)**. Segunda: **diferenciar visualmente tags de médicos das tags de CRM e reduzir intensidade**. Terceira: hierarquia opinativa nos SummaryCards.

## What's Working

1. **Filtros completos e bem feitos**: date range + médico + UF + tipo + bucket. Default 90 dias é sensato. `placeholderData: keepPreviousData` impede flicker quando muda página.
2. **Pagination excelente**: botões + input numérico direto com clamp e validação, atalhos Enter/Escape, `aria-label` em cada botão. Melhor que a média de painéis.
3. **Export CSV/Excel** com BOM para Excel pt-BR (`Buffer.from("﻿" + csv)`) — atenção rara a detalhe regional.
4. **Refresh médicos manual** com `window.location.reload()` — cru mas funcional. Atende Alex.
5. **Empty state da tabela** ("Nenhum contato encontrado com esses filtros.") existe — antecipa o caso vazio. (Mas falha quando a causa é erro, não filtro vazio.)
6. **Estado loading** propagado de page → filters → data-table (`isLoading={isLoading || isFetching}`) — botões desabilitam durante revalidação.

## Priority Issues

### [P0] Erro silencioso — `isError` do useQuery completamente ignorado
- **Why it matters**: O page.tsx desestrutura apenas `{ data, isLoading, isFetching }` do `useQuery`. Quando o BFF retorna 4xx/5xx, o componente continua renderizando com `data` antigo ou vazio. O usuário vê "Nenhum contato encontrado" mesmo quando a causa é falha de rede / API down — diagnóstico errado, decisão errada. É pior que a Home antes do harden, porque lá o erro pelo menos aparecia em destaque.
- **Fix**: Adicionar destructure `isError, error` e renderizar `<HomeErrorState>` (o mesmo padrão da Home — pode até extrair para `<ReportErrorState>` compartilhado). Parse 4xx/5xx, retry button, detalhes técnicos colapsados.
- **Suggested command**: `/impeccable harden painel/src/app/por-origem/page.tsx`

### [P0] Telemetry Blue overdose no data-table — viola One Accent Rule em escala dramática
- **Why it matters**: Tags CRM como `Badge variant="primary"` × 5 tags × 50 contatos por página = ~250 manchas tonais Telemetry Blue por viewport. É o pior offender de "BI genérico" / "AI slop azul" do projeto inteiro. Médicos usam `variant="success"` (verde), o que ajuda a separar dos CRM, mas a primária ainda toma a tela.
- **Fix**: Trocar `variant="primary"` das tags CRM por:
  - (a) `variant="default"` (neutral tonal) — discreto, deixa o nome falar.
  - (b) ou nova variante `subtle` (foreground/8 com border foreground/15) — texto preto sobre cinza-tintado, sem cor primária nenhuma.
  - Manter médicos em `success` (cor de afirmação faz sentido — "este contato está corretamente classificado") ou descer para `outline` com leading dot.
- **Suggested command**: `/impeccable colorize painel/src/app/por-origem/page.tsx`

### [P1] Hierarquia chapada nos SummaryCards e nos cards "Top 10"
- **Why it matters**: 4 KpiCards idênticos no grid 2×4 + 2 cards "Top 10" idênticos lado a lado = a mesma queixa que tínhamos na Home antes do bolder. Para uma página cujo JTBD é exploração, isso não é tão grave quanto na Home, mas ainda perde a chance de afirmar o que é o resultado "anormal" do recorte (% sem classificação alto? número grande de Contatos vs período anterior? etc.).
- **Fix**:
  - Hero candidato: **"Sem classificação"** com tone warning se `>30%` do total — o KPI acionável para quem quer melhorar a operação. Ocupa `col-span-6` no md.
  - Demais 3 KPIs descem para `col-span-2` cada na linha 1.
  - Linha 2 mantém os 2 "Top 10" mas com proporção 7/5 (médicos maior se houver mais médicos do que tags, ou variar conforme o `bucket` ativo).
- **Suggested command**: `/impeccable bolder painel/src/app/por-origem/page.tsx`

### [P1] Freshness/refresh ausente
- **Why it matters**: A página tem um botão "Recarregar lista de médicos" (refresh do cache de médicos), mas não tem "Atualizado às HH:mm" do próprio relatório. O usuário não sabe se o que está vendo reflete o "agora" ou um cache de 5 minutos atrás. Mesma falha da Home antes do harden.
- **Fix**: Reusar o `FreshnessIndicator` que extrairei da Home para um `components/freshness-indicator.tsx` compartilhado.
- **Suggested command**: `/impeccable harden painel/src/app/por-origem/page.tsx`

### [P1] Help/documentação zero
- **Why it matters**: "Recorte", "Com tag CRM", "Sem classificação", "Top 10 por volume" — termos opacos para Jordan. Mesma falha que a Home tinha antes do clarify.
- **Fix**: InfoTooltip nos 4 KpiCards do summary; rename "Recorte" → "Filtrar por"; tooltip no Select de bucket explicando cada opção; clarificar "volume" para "contatos" nas listas Top 10; glossário ao final.
- **Suggested command**: `/impeccable clarify painel/src/app/por-origem/page.tsx`

### [P2] h1 fraco + filters dentro de Card desnecessário
- **Why it matters**: `text-xl font-semibold` (20px) é inferior aos valores dos KPIs (30px) — mesma inversão hierárquica da Home pré-bolder. E os filtros estão envoltos em `<Card>` (border + bg + radius), criando uma "ilha" visual quando podiam ser uma faixa de comando aberta.
- **Fix**: h1 sobe para `text-3xl font-bold tracking-tight`. Filtros saem do `<Card>` e ganham apenas `flex flex-wrap gap-3 items-end` numa faixa no `bg-muted/30` ou direto sobre o background.
- **Suggested command**: `/impeccable bolder painel/src/app/por-origem/page.tsx`

### [P2] Build error pré-existente em export/route.ts:56
- **Why it matters**: `Buffer.from(...)` passado direto para `new Response(...)` está flagado pelo TypeScript desde a primeira critique da Home. Aceita em runtime (Node aceita Buffer como BodyInit), mas o `tsc --noEmit` falha — qualquer CI strict bloqueia.
- **Fix**: `new Response(new Uint8Array(buf), { headers: ... })` ou cast explícito `buf as unknown as BodyInit`. Aproveitar o sweep do harden.
- **Suggested command**: `/impeccable harden`

## Persona Red Flags

**Alex (Power User — operador CLIENTE_X)**
- ✅ Export CSV/Excel funcional.
- ✅ Refresh médicos manual.
- ✅ Pagination com input direto (digita "47" + Enter = vai pra página 47).
- ❌ Sem keyboard shortcut para mudar filtros.
- ❌ Filtros não persistem na URL — não pode mandar link "este relatório com esses filtros" para o time.
- ❌ Erro silencioso: quando o BFF cai, Alex vê tabela vazia e perde tempo conferindo filtros.

**Jordan (First-Timer — gestor de clínica)**
- ❌ "Recorte" — não sabe o que é.
- ❌ "Top 10 por volume" — volume do quê?
- ❌ "Com tag CRM" — CRM é sigla; tag é jargão.
- ❌ Sem tooltips em nada.
- ❌ A tela inteira é um mar de badges azuis — visualmente cansativo para olho não-treinado.

**Júlia (gestor via iframe)**
- ✅ KPI "Sem classificação" em tone warning chama atenção — boa intenção.
- ❌ Mas sem CTA: "1.247 sem classificação" e agora?
- ❌ "Top 10 médicos" pode ser longa lista — sem visualização gráfica (bar chart inline?), só números.
- ❌ Quando o BFF falha, ela acha que a operação simplesmente "não tem contatos" — diagnóstico errado.

## Minor Observations

- Em dash no comentário JSX da página (`// Data em BRT (UTC-3) ... — independe do fuso do browser.`) — não copy, mas para sweep purista substituir por dois pontos ou hífen-hífen.
- `window.open(.../api/por-origem/export?...)` para download — funciona, mas em iframe pode ser bloqueado por sandbox em alguns hosts. Considerar `<a download>` com `useRef` + click programático.
- Refresh médicos: `window.location.reload()` é destrutivo — perde filtros, scroll position, página atual. Trocar por `queryClient.invalidateQueries({ queryKey: ["por-origem"] })` + `queryClient.invalidateQueries({ queryKey: ["medicos"] })`.
- `placeholderData: keepPreviousData` é ótimo, mas durante revalidação não há sinal visual no data-table (só nos botões dos filtros). Adicionar `opacity-70` na tabela enquanto `isFetching && !isLoading`.
- Filters tem `className="w-[140px]"` e `w-[200px]` hardcoded em selects — quebra em mobile (320px viewport). Usar `w-full md:w-[140px]` etc.
- A coluna "Tags CRM" pode ter 0..N tags; quando N>3, badges quebram em N linhas e a célula fica gigante. Considerar truncar com "+N mais" igual ao Default conectado da Home.
- DateRangePicker e Select são presumivelmente componentes próprios — não inspecionados nesta critique.
- pageSize 50 fixo — Power user pode querer 100 ou 200. Expor no UI ou via query param.

## Questions to Consider

- O JTBD de `/por-origem` é exploração analítica (Jordan/Júlia entende padrão) ou operação (Alex baixa lista para o time)? A resposta muda se `/por-origem` precisa do tom analítico/Mixpanel da Home ou de um tom mais operacional/Linear.
- O filtro "Recorte" tem 4 opções (`all`, `with_medico`, `without_medico`, `with_crm`) — falta `without_crm` para simetria? Ou esse é o caso "Sem classificação" do KPI?
- Quando uma operação tem milhares de contatos sem classificação, o gestor precisa de ação em massa (atribuir médico) — isso vive aqui ou em outra tela?
- Os 2 cards "Top 10" são realmente dois tops separados, ou faz sentido fundir em um só "Top distribuições" tabulável (médico ↔ tag CRM)?
- O export funcional já cobre o caso "preciso mandar para alguém" — qual o gap restante: assinaturas? scheduling? envio direto por email?
