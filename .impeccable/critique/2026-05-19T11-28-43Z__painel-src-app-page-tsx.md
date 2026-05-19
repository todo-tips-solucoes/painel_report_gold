---
target: painel/src/app/page.tsx
total_score: 27
p0_count: 0
p1_count: 1
p2_count: 2
timestamp: 2026-05-19T11-28-43Z
slug: painel-src-app-page-tsx
---
# Critique: painel/src/app/page.tsx (Home — "Visão geral") — Run 2

## Design Health Score

| # | Heuristic | Score | Δ | Key Issue |
|---|-----------|-------|---|-----------|
| 1 | Visibility of System Status | 3 | +2 | "Atualizado às HH:mm" + refresh button + stale warning + isFetching state. Solid. |
| 2 | Match System / Real World | 3 | +1 | Labels em PT claro ("Tempo de resposta", "Entrega de mensagens", "Conexão padrão"). "p90" ainda exposto (mitigado por tooltip). |
| 3 | User Control and Freedom | 2 | +1 | Refresh manual existe. Sem mudança de janela temporal, drill-down ou keyboard shortcut. |
| 4 | Consistency and Standards | 3 | +1 | "Default conectado" virou KpiCard real. Tones ainda têm thresholds inconsistentes entre KPIs. |
| 5 | Error Prevention | 3 | +1 | Zod nas APIs + parsing inteligente do erro + retry. |
| 6 | Recognition Rather Than Recall | 3 | +1 | InfoTooltip em todos os KPIs + glossário expansível. |
| 7 | Flexibility and Efficiency | 1 | 0 | Sem keyboard shortcuts, sem filtros, sem atalhos para o Alex. |
| 8 | Aesthetic and Minimalist Design | 3 | +1 | Hierarquia opinativa real (hero dinâmico). One Accent Rule restaurada no heatmap. Tipografia ainda system-ui. |
| 9 | Error Recovery | 3 | +2 | Retry button + parsing 4xx/5xx + detalhes técnicos colapsados. |
| 10 | Help and Documentation | 3 | +3 | Tooltips help em 8 KpiCards + glossário com 6 termos. CTA implícita no heatmap. |
| **Total** | | **27/40** | **+13** | **Solid (era Needs significant work)** |

Banda: 14 → 27 representa salto de **+93%**. Sai de "Needs significant work" (≤16) e supera "Médio" (17-24), aterrissando em "Solid" (25-32). Para chegar a "Excelente" (33+) faltariam principalmente Flexibility (+2) e refinamentos de tipografia.

## Anti-Patterns Verdict

**LLM assessment**: significativamente menos AI slop que o run 1. O conjunto **hero dinâmico que se adapta ao estado** + **paleta neutra tintada** + **glossário no rodapé** + **One Accent Rule no heatmap** é incomum em outputs IA padrão — não é o que o LLM produz "por reflexo".

O que ainda registra como AI-detectable, em ordem decrescente:
- Tipografia **system-ui sem identidade**: sem fonte customizada (Inter/Söhne/Tiempos), a página parece "Tailwind preflight" mesmo com hierarquia melhor.
- **Light theme único, layout grid clássico**: coerente com Stripe/Notion refs, mas sem nenhum risco visual.
- **Ícone Info do Lucide sem customização** ao lado do label: cumpre função, mas é o ícone que aparece em todo dashboard IA-gerado.

**Deterministic scan**:
- `detect.mjs` **continua indisponível** (`bundled detector not found`); reportado como fallback.
- Greps manuais confirmam o trabalho dos comandos anteriores:
  - `#fff` / `"white"` / `hsl(0 0% 100%)` → **0 ocorrências** em `src/`.
  - `bg-primary/[alpha]` no heatmap → **0 ocorrências** leftover.
  - Em dash em copy de usuário → **0 ocorrências**. As 4 ocorrências restantes são em comentários de código JSX/JS (não renderizam) + 1 caractere `"—"` como placeholder visual quando não há conexão padrão (convenção tipográfica aceita).

**Visual overlays**: skipped (sem dev server e sem browser automation nesta sessão).

## Overall Impression

A Home passou de **placeholder shadcn competente** para um **instrumento de leitura rápida que afirma estado**. O hero dinâmico é a transformação mais importante: a tela escolhe o KPI que merece atenção em vez de pedir varredura cognitiva. Os tooltips e o glossário ao final fazem o painel acolher Jordan sem cobrir Júlia.

O que sobra como alavanca: **interatividade e identidade tipográfica**. O painel ainda é só leitura — sem alterar período, sem comparar com semana anterior, sem drill-down em KPIs. E ainda parece "qualquer SaaS bem desenhado", não "o painel da CLIENTE_X especificamente". Esses dois últimos 30% de score moram nessas frentes.

## What's Working

1. **Hero dinâmico** (`pickHero`): a tela seleciona o KPI principal conforme estado (`conexões caídas` > `mensagens perdidas` > `tickets hoje`). Material concreto do princípio "Hierarquia opinativa" e do tom analítico escolhido. Raro em painéis SaaS desta categoria.

2. **Error state rico**: parsing dos erros do BFF (4xx vs 5xx vs network), cores distintas (warning amber vs destructive red), retry button funcional, detalhes técnicos colapsados em `<details>` para Alex sem cobrir Júlia. Superior à média de painéis embedados.

3. **Acessibilidade do heatmap**: 168 células agora têm `aria-label` individual ("Seg 14h, 87 tickets"). O `role="img"` no container resume o gráfico. Saiu de "única alternativa textual via `title=`" para navegável por leitor de tela.

4. **Tooltips help acessíveis por teclado**: `:focus-within` no `<button>` do `<InfoTooltip>` revela o conteúdo via Tab. CSS-only, sem dependência de Radix (que não está no projeto). Respeita `prefers-reduced-motion`.

5. **Freshness contínuo**: `setInterval` 60s reavalia `isStale` sem precisar refetch — o tom warning aparece sozinho após 5min. Refresh manual via clique no `RefreshCw` invalida só a query da Home, preservando o cache de outras telas.

## Priority Issues

### [P1] Flexibility ainda em 1 — controle temporal e atalhos ausentes
- **Why it matters**: O tom escolhido pelo usuário foi "Você não sabia disso" (analítico/Mixpanel-like) — esse tom exige **comparativos** ("Tickets hoje, +18% vs. ontem") e **mudança de janela** ("ver só esta semana"). A Home atual só responde ao recorte fixo (hoje, 7d, 30d) e não permite alterar nada. Para o operador CLIENTE_X em 20+ contas, a ausência de atalhos de teclado força mouse para cada refresh.
- **Fix**:
  - Filtro de janela temporal no header (`Hoje | 7d | 30d | 90d` como toggle), persistido em URL search param.
  - Atalho de teclado: `R` = refresh, `?` = abrir glossário, `1-4` = trocar período.
  - Expor delta vs. período anterior no BFF e usar a prop `delta` do `KpiCard` (já está pronta no componente, só falta dado).
- **Suggested command**: `/impeccable harden` (controles) ou estender o BFF para comparativos.

### [P2] Tipografia ainda system-ui — sem identidade CLIENTE_X
- **Why it matters**: Stripe e Notion (referências declaradas no PRODUCT.md) têm fontes que carregam identidade (Söhne na Stripe, Inter no Notion). Manter `ui-sans-serif, system-ui, ...` mantém o painel parecendo "qualquer SaaS bem feito". A Scale Gap Rule do DESIGN.md também sugere abrir mais a escada (Title→Body é 1.14, abaixo do 1.25 mínimo).
- **Fix**:
  - `next/font/google` carregando **Inter** com `display: 'swap'`, ou similar tipo **Geist Sans**.
  - Atualizar `tailwind.config.ts` `fontFamily.sans` para a nova stack.
  - Ajustar `text-sm` (Title=14px) para 13px OU subir Title para 18px — fechar o gap.
- **Suggested command**: `/impeccable typeset`.

### [P2] Heatmap em mobile vira scroll horizontal — perde glance-and-go
- **Why it matters**: Em viewport <md, a tabela 7×24 obriga scroll lateral. Para o operador em tablet de clínica, o JTBD "como estamos?" falha aqui — o heatmap deixa de ser glance-and-go.
- **Fix**:
  - Versão mobile: lista vertical "Top 5 horas-dia com mais atendimentos nos últimos 28 dias" (texto), com botão "Ver heatmap completo" expandindo a versão atual.
  - Ou: rotacionar (hora × dia) numa coluna vertical scrollável.
- **Suggested command**: `/impeccable adapt`.

## Persona Red Flags

**Alex (Power User — operador CLIENTE_X em ~20 contas)**
- ✅ Refresh manual via clique agora funciona.
- ❌ Ainda sem `R` para refresh.
- ❌ Ainda sem alternar `companyId` rapidamente — precisa rebuildar o iframe.
- ❌ Ainda sem mudança de janela temporal (7d/30d/90d).
- ✅ Erros 4xx/5xx agora distinguíveis pelo título + cor.
- ✅ `<details>Detalhes técnicos</details>` mostra raw para inspeção sem expor para Júlia.

**Jordan (First-Timer — gestor de clínica)**
- ✅ "Conexão padrão" em vez de "Default conectado" — anglicismo eliminado.
- ✅ Tooltips em todos os KPIs com definição contextual.
- ✅ Glossário ao final convida estudo.
- ✅ Captions humanos no hero ("X mensagens enviadas pela operação não chegaram ao destinatário nos últimos 30 dias").
- 🟡 Em touch, tooltip exige 2 taps (foco + leitura) — funcional mas confuso. Glossary cobre.

**Júlia (dona da clínica via iframe)**
- ✅ Hero adapta-se ao estado da operação — quando há problema, ela vê imediatamente o que.
- ✅ Mensagens de freshness ("Atualizado às 14:23") aumentam confiança.
- ❌ Sem benchmark vs. período anterior — "87 tickets hoje" continua sem contexto absoluto.
- ❌ Em mobile, heatmap perde leitura.

## Minor Observations

- **Em dash em comentários de código** (4 ocorrências em `page.tsx`/`info-tooltip.tsx`/`heatmap.tsx`). Não viola a regra (que é sobre *copy*), mas para um sweep purista, substituir por `--` ou reescrever frases dos comentários.
- **`"—"` como placeholder no `KpiCard` value** quando `activeNames.length === 0`: convenção visual aceitável, mas para coerência com a regra, considerar `"sem"` em pt-BR ou simplesmente `"0"` (já que `tone="destructive"` já comunica anomalia).
- **Subtítulo "Resumo dos últimos 30 dias"** pode confundir: o KPI hero pode ser "Tickets hoje" (que não é 30d). Trocar para "Visão consolidada" ou "Indicadores recentes".
- **Botão refresh `h-7 w-7`** (28×28px) está abaixo da área de toque recomendada para mobile (44×44px WCAG). Considerar `h-9 w-9` em viewport touch, ou aumentar `hit-area` invisível.
- **`stale threshold = 5min`** é arbitrário e silencioso — após 5min o tom vira `warning` mas sem texto explicativo. Adicionar título tooltip ao timestamp explicando.
- **Heatmap legenda**: o salto entre "Pico" (>0.85 → bg-primary) e o segundo nível (>0.65 → foreground/55) é mais largo que entre os outros níveis. Estatisticamente ok, mas pode dar impressão de que "tudo é pico ou nada é pico". Considerar nível intermediário foreground/70 entre 0.7 e 0.85.
- **Os 8 KpiCards têm `help` definido**, mas o `<Info>` icon só aparece se `help` é truthy — bom default; já cobre os 8 atuais.
- **Acessibilidade**: o `<Glossary />` usa `<details><summary>` nativo, que é ótimo para leitor de tela, mas não tem indicador visual de expandido/colapsado além do triângulo padrão do browser. Considerar `aria-expanded` ou um ícone explícito.

## Questions to Consider

- O filtro de janela temporal (`Hoje | 7d | 30d`) vale a complexidade na Home, ou ela deve continuar dedicada ao recorte "como estamos hoje?" e o detalhe morar nas páginas internas (`/atendimento`, `/pipeline`)?
- Para o tom analítico "Você não sabia disso", **deltas vs. período anterior** são essenciais — qual é o caminho mais barato para o BFF expor isso (recomputar duas janelas? cachear baseline diário?).
- A próxima alavanca de design depois de `polish`: identidade tipográfica (`typeset`) ou interatividade (filtros + atalhos)?
- O heatmap responde a alguma decisão concreta hoje (escalar plantão na quinta às 14h)? Se sim, a CTA implícita poderia virar explícita: "Sugerir escala" ou "Exportar para folha de plantão".
- Para o iframe-embed no CRM host, faz sentido escutar `postMessage` do host para mudar `companyId` sem rebuild? Power user no Alex.
