---
target: painel/src/app/por-origem/page.tsx
total_score: 30
p0_count: 0
p1_count: 1
p2_count: 2
timestamp: 2026-05-19T12-13-12Z
slug: painel-src-app-por-origem-page-tsx
---
# Critique: painel/src/app/por-origem/page.tsx — Run 2

## Design Health Score

| # | Heuristic | Score | Δ | Key Issue |
|---|-----------|-------|---|-----------|
| 1 | Visibility of System Status | 3 | +1 | FreshnessIndicator no header (Atualizado às HH:mm + spinner refresh). isFetching propagado. Stale automático. |
| 2 | Match System / Real World | 3 | +1 | "Recorte" → "Filtrar por". Glossário 6 termos. Tooltips em KPIs. Subtítulo natural. |
| 3 | User Control and Freedom | 3 | 0 | Mesmo controle + refresh sem perder filtros. Sem keyboard shortcuts ainda. |
| 4 | Consistency and Standards | 3 | +1 | h1 alinhado com Home. Layout 12-col + hero dinâmico no SummaryCards. TopList padrão visual coerente. Filters sem Card desnecessário. |
| 5 | Error Prevention | 3 | +1 | Zod nas APIs. **Build error em export/route.ts:56 CORRIGIDO** (typecheck inteiro do projeto agora limpo). |
| 6 | Recognition Rather Than Recall | 3 | +1 | 6 KpiCards com help + glossário 6 termos + títulos concretos ("Top 10 com mais contatos"). |
| 7 | Flexibility and Efficiency | 3 | 0 | Export + refresh + pagination direta. Sem keyboard, sem URL sync (pendente). |
| 8 | Aesthetic and Minimalist Design | 3 | +1 | Hierarquia opinativa (hero dinâmico). Badges CRM `subtle` neutras tonais (zero mancha azul). TopList com barra inline. |
| 9 | Error Recovery | 3 | **+3** | `isError` detectado, ReportErrorState compartilhado (parsing 4xx/5xx + retry + details). keepPreviousData preserva contexto. |
| 10 | Help and Documentation | 3 | **+3** | InfoTooltip em 6 KpiCards + tooltips nos TopList headers + Glossário com 6 definições. |
| **Total** | | **30/40** | **+12** | **Solid superior** (era *Médio*) |

**Trend `painel-src-app-por-origem-page-tsx`: 18 → 30**, salto de **+67%**. Próximo da banda "Excelente" (33+); 3 pontos restantes moram principalmente em Flexibility e refinamentos.

## Anti-Patterns Verdict

**LLM assessment**: significativamente menos AI slop. As 4 transformações principais que tiraram o cheiro:

1. **Tags CRM `variant="primary"` → `subtle`**: as ~250 manchas azuis tonais por página viraram pílulas neutras (foreground/4% bg sobre Paper White) — texto preto sobre cinza-tintado, sem cor de marca. Combinado com o cap de 4 tags visíveis + "+N" badge, a tabela ganha **espaço de respiração**.
2. **Hero dinâmico no SummaryCards**: a tela elege "Sem classificação (atenção)" quando ratio > 30% — afirma a anomalia operacional automaticamente. Caso geral fica "Contatos no período".
3. **Filters fora do `<Card>`**: faixa de comando aberta em `bg-muted/30` substitui o container redundante.
4. **TopList com barra inline**: cada item ganha micro bar chart proporcional. Primeiro lugar em primary (cor de ação = "aqui está o pico"), demais em `foreground/30` — One Accent Rule honrada.

O que ainda registra como AI/template:
- Tipografia system-ui (mesmo problema da Home; é um trabalho de `typeset` global).
- Filtros usando `<select>` nativo sem skin custom (funciona bem, mas é "shadcn defaults").
- Layout grid clássico, sem ousadia visual (defensável para um relatório).

**Deterministic scan**:
- `detect.mjs` continua indisponível.
- Greps manuais confirmam o trabalho:
  - `#fff` / `"white"` / `hsl(0 0% 100%)` em `por-origem/`: **0 ocorrências**.
  - `bg-primary/[alpha]` em `por-origem/`: **0 ocorrências**.
  - `variant="primary"` em `por-origem/`: **0 ocorrências** (era badge predominante das tags CRM antes).
  - Em dash em copy de usuário: **0** (1 ocorrência foi corrigida durante o sweep; 2 restantes são comentários JSX, 2 são `"—"` standalone como placeholder).
- **Bonus**: build error pré-existente em `export/route.ts:56` consertado — `tsc --noEmit` do projeto inteiro agora retorna **clean**.

**Visual overlays**: skipped.

## Overall Impression

A `/por-origem` deixou de ser a página com maior dissonância entre função e forma e passou a ser **um relatório de leitura confiante**: filtros funcionais sem ruído, hero que afirma a anomalia, tabela densa sem mancha de cor, error state inteligente. O hero dinâmico aqui é diferente da Home — ele dispara em condição de problema (anomalia > 30% sem classificação) em vez de selecionar entre estados; isso casa com o JTBD analítico desta tela.

Alavancas que sobram: **interatividade** (keyboard shortcuts, URL sync de filtros) e **identidade tipográfica** (mesma alavanca da Home, escopo global do projeto).

## What's Working

1. **Componentes compartilhados extraídos**: `FreshnessIndicator` + `useFreshnessClock` + `ReportErrorState` + `parseFetchError` agora vivem em `components/`. Home e `/por-origem` consomem ambos — qualquer melhoria futura num desses módulos beneficia todas as páginas.
2. **Hero condicional baseado em dado** (`pickHero`): "Sem classificação" só vira hero quando ratio > 30% — não usa só primeiro/maior, usa **acionabilidade**. Caso geral mantém pulso "Contatos no período".
3. **Refresh manual sem destruir contexto**: troca `window.location.reload()` por `invalidateQueries` → preserva filtros, scroll, página atual.
4. **TagList com cap visual**: 4 tags visíveis + "+N" com tooltip. Linhas da tabela mantêm altura previsível mesmo em contatos densos.
5. **Glossário 6 termos** específicos da página (Contato, Tag de médico, Tag CRM, Sem classificação, Filtrar por, Exportar) — Jordan tem onde estudar.
6. **Error preserva data antiga**: `if (isError && !data)` — cobre tela completa só na primeira falha. Em revalidação com erro, mantém dado anterior visível e sinaliza via stale.
7. **Filters mobile-friendly**: `w-full md:w-[X]` em todos os selects.

## Priority Issues

### [P1] Flexibility ainda em 3 — keyboard shortcuts + URL sync ausentes
- **Why it matters**: Alex (operador CLIENTE_X em ~20 contas) usa esta página muito (export + analytics). Sem `R` (refresh), `?` (glossário), `/` (focar primeiro filtro), `1-4` (alternar Recorte), `e` (export Excel), o fluxo é mouse-bound. Sem URL sync, não dá pra mandar link "veja este relatório com estes filtros" para o time.
- **Fix**:
  - Hook `useKeyboardShortcut` global, ou key listener no `<header>`.
  - Persistir filtros em `searchParams` via `useRouter().replace()` (compartilhável + back/forward navega entre filtros).
- **Suggested command**: `/impeccable harden` (continuação) ou estender com hook custom.

### [P2] Skeleton de loading inicial
- **Why it matters**: Na primeira carga, a tabela mostra "Carregando..." centralizado em vez de skeleton com shape final. Diferente da Home que tem skeleton rico.
- **Fix**: Substituir o estado "Carregando..." por linhas skeleton (5-10 `<Tr>` com `bg-muted/40 animate-pulse` em cada `<Td>`), preservando shape de coluna.

### [P2] Validação cross-field nos filtros (from > to)
- **Why it matters**: `DateRangePicker` aceita qualquer combinação. Se `from > to`, o BFF retorna lista vazia silenciosamente — mesmo problema do erro silencioso (mas em outra forma).
- **Fix**: Validar antes de enviar; mostrar mensagem inline no DateRangePicker.

### [P3] pageSize fixo em 50
- **Why it matters**: Power user com 10k+ contatos quer 200 ou 500 por página.
- **Fix**: Adicionar Select "Tamanho: 50 / 100 / 200" no rodapé da tabela.

## Persona Red Flags

**Alex (Power User)**
- ✅ Refresh manual preserva filtros agora.
- ✅ Export CSV/Excel funcional e tipado.
- ✅ Pagination com input direto.
- ❌ Sem keyboard shortcuts.
- ❌ Sem URL sync — não compartilha link com filtros.
- ❌ pageSize fixo em 50.

**Jordan (First-Timer)**
- ✅ "Filtrar por" no lugar de "Recorte".
- ✅ Tooltips em todos os KPIs.
- ✅ Glossário 6 termos explica jargão.
- ✅ Captions humanos no hero.
- ✅ Mensagem amigável quando não há contatos no recorte ("Ajuste as datas ou o filtro.").

**Júlia (gestor)**
- ✅ Hero dispara automaticamente quando ratio "sem classificação" passa de 30% — alarme contextual em vez de número agressivo permanente.
- ✅ Caption do hero explica em PT a próxima ação ("Distribuir esses contatos é a próxima ação.").
- ✅ Erro tratado: BFF caído não vira mais "Nenhum contato encontrado".
- ❌ Heatmap de origem ao longo do tempo seria útil aqui também (igual ao da Home).

## Minor Observations

- Em dash residual em comentários JSX (2 ocorrências em `summary-cards.tsx`) — não copy, mas sweep purista vale.
- `"—"` standalone como placeholder de campo vazio (2 ocorrências em `data-table.tsx`) — convenção visual aceitável.
- `staleTime: STALE_THRESHOLD_MS` (5min) é o mesmo da Home — bom; centralizar essa constante mais ainda valeria (já está em `freshness-indicator.tsx`).
- Botão refresh do FreshnessIndicator faz `invalidateQueries({ queryKey: ["por-origem"] })` que invalida **todas** as queries por-origem (qualquer combinação de filtros). Pode disparar mais refetches que o necessário se o user mudou de filtros recentemente. Solução: invalidar só com o qs atual.
- DateRangePicker e Select interno não foram inspecionados — aceitam o pattern atual.
- Loading state da tabela ("Carregando...") usa em dash de "..." (ellipsis ASCII). Já é um caractere standalone, ok.
- Refresh dos médicos (botão "Médicos" no filters) agora também invalida `por-origem` — bom, mas pode ser overkill se médicos não mudaram. Considerar invalidar só se a resposta `/api/medicos/refresh` indicar mudança.

## Questions to Consider

- O `/por-origem` deveria também ter um heatmap de origem × dia/semana (similar ao da Home) para mostrar tendência?
- Ações em massa ("atribuir médico aos 1.247 sem classificação") moram aqui ou em uma página dedicada de operação?
- O export CSV/Excel atual mantém os filtros mas ignora paginação — isso é o esperado, ou Júlia quer "exportar exatamente o que vê na tela"?
- URL sync de filtros: vale a complexidade extra (back/forward nav) ou é over-engineering para o uso real?
- A próxima alavanca de design no projeto inteiro: tipografia (`typeset` global) ou interatividade (keyboard shortcuts, URL sync)?
