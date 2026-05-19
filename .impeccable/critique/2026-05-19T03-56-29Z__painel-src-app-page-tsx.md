---
target: painel/src/app/page.tsx
total_score: 14
p0_count: 2
p1_count: 2
timestamp: 2026-05-19T03-56-29Z
slug: painel-src-app-page-tsx
---
# Critique: painel/src/app/page.tsx (Home — "Visão geral")

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 1 | Sem "atualizado às HH:mm", sem refresh manual, `staleTime: 5min` invisível ao usuário; erro raw |
| 2 | Match System / Real World | 2 | "TMA", "ack3plus", "Default conectado" (anglicismo), "n=512" sem definição |
| 3 | User Control and Freedom | 1 | Sem refresh manual, sem mudança de período/granularidade, sem drill-down |
| 4 | Consistency and Standards | 2 | Card "Default conectado" replica KpiCard manualmente; tones de KPI com lógicas diferentes |
| 5 | Error Prevention | 2 | Zod nas APIs OK; fetch error mostra raw `Falha 502:` sem orientação |
| 6 | Recognition Rather Than Recall | 2 | Sem tooltips/glossário; termos técnicos sem expansão |
| 7 | Flexibility and Efficiency | 1 | Sem keyboard shortcuts, sem atalho refresh, sem filtros, sem comparativos |
| 8 | Aesthetic and Minimalist Design | 2 | Grade de cards idênticos sem hierarquia; h1 menor que valor KPI; #fff puro; em dash |
| 9 | Error Recovery | 1 | Sem retry, sem orientação, sem distinção 4xx/5xx |
| 10 | Help and Documentation | 0 | Zero tooltips, zero glossário, zero "?" ao lado de termos |
| **Total** | | **14/40** | **Needs significant work** |

## Anti-Patterns Verdict

**LLM assessment**: Sim, parece AI-generated/template SaaS. A Home bate em vários dos anti-refs declarados no PRODUCT.md e nas design laws do próprio impeccable:

- **Anti-ref #1 (SaaS template Bootstrap/AdminLTE)** ativo: paleta default shadcn (Telemetry Blue `#2563eb` + slate neutros) + grade de cards visualmente idênticos. Qualquer SaaS de 2023 se parece com isso.
- **Anti-ref "BI corporativo genérico"** ativo: 7 KpiCards iguais lado a lado, sem hierarquia. Nada afirma "este número importa mais que aquele".
- **Banimento `em dash` violado** (2 ocorrências): `"KPIs operacionais consolidados — últimas janelas"` e `"Distribuição de criação de tickets — identifica picos de carga"`.
- **Banimento `#fff` puro violado**: `volume-line.tsx` injeta `background: "white"` no tooltip Recharts.
- **Heatmap satura a tela de Telemetry Blue** (gradiente `bg-primary/10` → `bg-primary` em 168 células), reforçando ainda mais o efeito SaaS-blue e excedendo The One Accent Rule.
- **Inversão de hierarquia**: `<h1 className="text-xl font-semibold">` (20px) é tipograficamente menor que cada `KpiCard value` (`text-3xl` = 30px). O nome da tela perde para 7 valores numéricos.

**Deterministic scan**: indisponível — `detect.mjs` retornou `Error: bundled detector not found`. Reportado como degradação, não bloqueio.

**Visual overlays**: nenhum (sem dev server rodando nesta sessão; sem browser automation acessada).

## Overall Impression

A Home **entrega o dado** mas falha em responder ao job-to-be-done central declarado no PRODUCT.md: *"decisão rápida ('como estamos hoje?')"*. O gestor abre o painel, vê 7 caixas iguais e 2 gráficos, e tem que **fazer a pergunta** ao painel — o painel não a responde primeiro. Visualmente é um placeholder shadcn competente, não um instrumento de leitura instantânea.

A maior alavanca: **hierarquia opinativa**. Em segundo lugar: **freshness/controle** (não saber "de quando é este dado?" mata a confiança na leitura rápida).

## What's Working

1. **KpiCard como primitivo**: a estrutura interna está correta — Label uppercase (12px) → Valor Display tabular-nums (30px) → contexto (12px). É o modelo de hierarquia que falta no resto da página. O componente em si é o melhor design da Home.
2. **Tratamento de iframe params inválidos**: renderiza Zod field errors em PT amigável, raro em painéis embed. Boa defesa de borda.
3. **Loading skeleton com `animate-pulse`** existe e preserva shape parcial — melhor que tela branca. (Embora possa preservar muito mais shape.)

## Priority Issues

### [P0] Hierarquia chapada na grade de KPIs
- **Why it matters**: 7 KpiCards visualmente idênticos disputam atenção igualmente. Para um gestor com 5 segundos, o painel não responde "como estamos?" — ele convida a varredura cognitiva. Viola o princípio nº2 do PRODUCT.md ("Hierarquia opinativa — nada é igual a tudo") e o "Don't" do DESIGN.md sobre "grade de cards visualmente idênticos".
- **Fix**: Eleger 1-2 KPIs heróis (provavelmente "Tickets hoje" + "Mensagens perdidas" — os únicos com leitura emocional clara). Hero ocupa `col-span-2 md:col-span-2`, Display sobe para `clamp(2.5rem, 5vw, 3.5rem)` (40-56px), com delta vs período anterior em verde/vermelho ao lado. Demais KPIs descem para `text-2xl` ou viram linha tabular. `<h1>` sobe para `text-3xl` (30px) e ganha um subtítulo com "atualizado às HH:mm" inline.
- **Suggested command**: `/impeccable bolder painel/src/app/page.tsx`

### [P0] Zero indicação de freshness / refresh
- **Why it matters**: `staleTime: 5 * 60_000` (5min) e nada na UI sinaliza isso. "Como estamos hoje?" requer saber *quando é "hoje"*. Sem timestamp, sem refresh manual, sem indicador de stale, sem spinner de revalidação. Viola Nielsen #1 (Visibility) e o JTBD declarado.
- **Fix**: Subtítulo `<p>` ganha `Atualizado às {HH:mm}` (cor muted-foreground) + ícone refresh discreto (Lucide `RefreshCw`) ao lado, clicável → `queryClient.invalidateQueries(['home'])`. Em estado `isFetching && !isLoading` o ícone rotaciona. Após 5min sem refetch, tom da timestamp fica `text-warning`.
- **Suggested command**: `/impeccable harden painel/src/app/page.tsx`

### [P1] Anti-patterns concretos (em dash + #fff + Telemetry Blue overdose)
- **Why it matters**: O DESIGN.md proíbe explicitamente: em dash em copy (3 ocorrências entre page + heatmap CardDescription), `#fff` puro (tooltip Recharts), e Telemetry Blue como mancha principal (heatmap pinta a tela inteira em variações da cor de ação). Mantê-los garante que qualquer comando subsequente herde o ruído.
- **Fix**:
  - Trocar `— últimas janelas` por `· últimas janelas` ou `(últimas janelas)`.
  - Trocar `— identifica picos de carga` por `. Identifica picos de carga.`
  - Tooltip Recharts: `background: "var(--background)"` (ou substituir Recharts por `<Tooltip />` shadcn de fato tematizado) e migrar token `background` no Tailwind de `hsl(0 0% 100%)` para `oklch(99% 0.003 264)`.
  - Heatmap: trocar `bg-primary/X` por uma rampa `bg-foreground/X` (slate escuro tintado) e usar `bg-primary` **somente** na célula de pico. Mantém leitura de intensidade, devolve One Accent Rule.
- **Suggested command**: `/impeccable colorize painel/src/app/page.tsx`

### [P1] Help/documentação zero — termos técnicos sem expansão
- **Why it matters**: "TMA mediano", "Taxa de entrega — leitura: 78% · n=512", "Mensagens perdidas (30d)", "Default conectado" — todos termos válidos internamente, opacos para gestor novo. Score 0 em Nielsen #10 não é exagero; é fato. Persona Jordan (gestor first-timer) abandona ou liga para o suporte.
- **Fix**: Adicionar `<HelpTooltip>` (ícone `Info` 14px ao lado do label do KpiCard) com 1 frase explicando o termo. Glossário expansível ao final da página (`<details><summary>O que estes termos significam?</summary>`). Trocar `n=512` por `512 mensagens analisadas`.
- **Suggested command**: `/impeccable clarify painel/src/app/page.tsx`

### [P2] Error state pobre + Loading skeleton genérico
- **Why it matters**: Erro fetch mostra `Falha 502: <raw>` em destructive plain — sem botão "Tentar de novo", sem distinção 4xx/5xx, sem orientação. Loading skeleton mostra 4 cards + 1 card pulse: usuário não antecipa a forma final (faltam 4 KPIs da segunda linha, faltam título, faltam o heatmap).
- **Fix**: Empty error: ícone `AlertCircle`, copy "Não foi possível carregar agora", botão outline "Tentar de novo", detalhes técnicos colapsados em `<details>`. Skeleton: replicar 8 KPIs + título + 2 charts, mantendo posição final exata.
- **Suggested command**: `/impeccable harden painel/src/app/page.tsx`

## Persona Red Flags

**Alex (Power User — operador CLIENTE_X acompanhando ~20 contas embedadas)**
- Sem keyboard shortcut para refresh — precisa de F5 (que recarrega tudo, inclusive o iframe do CRM host).
- Sem alternar companyId rapidamente — precisa rebuildar o iframe com novos query params.
- Sem mudar janela temporal (hoje/7d/30d viraram colunas fixas em vez de filtro alternável).
- Erro raw 502 sem distinção: "é o BFF que caiu, é o tenant mal configurado, é o Supabase fora?" — Alex abre Network tab.

**Jordan (First-Timer — gestor de clínica abrindo pela primeira vez)**
- "TMA mediano" não significa nada. Sem definição visível.
- "Taxa de entrega (30d) — leitura: 78% · n=512" mistura 3 conceitos sem explicar: o que é taxa de entrega, o que é leitura, o que é n.
- "Mensagens perdidas (30d)" — perdidas como? Perdidas pela operação ou não entregues pelo provedor? Sem tooltip.
- "Default conectado" + badges com nomes técnicos — Jordan não sabe se isto é bom ou ruim.
- Sem onboarding, sem tour, sem "?". Abandono provável no primeiro acesso.

**Júlia, dona da clínica (persona projeto-específica)**
- Vê "Tickets hoje: 87" sem benchmark — é bom? é ruim? Sem meta, sem comparativo "vs ontem", sem barra de progresso até a meta.
- Vê "Mensagens perdidas: 0" e relaxa — mas isso é só "30d"; pode haver picos pontuais que essa janela esconde.
- Sem alerta visual quando algo *está* anômalo (o `tone="warning"` em TMA só dispara > 600s; tudo abaixo parece OK mesmo quando piora 200%).
- Abre o iframe no celular durante a consulta — heatmap vira scroll horizontal e perde glance-and-go completamente.

## Minor Observations

- Título da aba: `"Painel Relatórios"` — falta "de". Layout linha 7.
- Card "Default conectado" mostra `slice(0, 3)` sem indicar "+N mais" quando há mais de 3 conexões — usuário não sabe que está truncado.
- `useQuery` aceita default `refetchOnWindowFocus: true` (Tanstack v5) — comportamento OK mas não documentado / não comunicado ao usuário.
- Recharts: cores hardcoded como string HSL (`stroke="hsl(221 83% 53%)"`) — quando paleta migrar, gráfico não acompanha. Mover para CSS variable.
- Heatmap legenda "Max/hora-dia: 87" alinhada à direita (`ml-auto`) está visualmente desconectada da legenda de intensidade à esquerda — agrupar ou separar com `<hr>`.
- Heatmap usa `title=""` para tooltip — único canal de acessibilidade, e não focável por teclado (`<div>` em vez de `<button>`).
- `tmaTone` tem 3 thresholds (`<60s success`, `<600s default`, `else warning`) mas "Mensagens perdidas" tem só 2 (`>0 destructive`, else success). Lógica de tone inconsistente entre KPIs.

## Questions to Consider

- Se você só pudesse mostrar **uma** métrica nesta home, qual seria? Por que ela não está em destaque visual proporcional?
- O heatmap responde a alguma decisão acionável ("agendar reforço na quinta às 14h"), ou é decoração analítica? Se acionável, qual a CTA implícita?
- "Mensagens perdidas (30d)" é métrica de operação (precisa ação) ou de produto (informa estado)? A diferença muda onde e como ela aparece.
- Qual é a *primeira frase emocional* que você quer que o gestor pense ao abrir esta tela: "minha operação está sob controle", "este sistema vê o que eu não vejo", "preciso fazer algo agora"? A Home atual não compromete com nenhuma.
- Para o time interno CLIENTE_X operando 20+ contas, qual é o atalho que faria a diferença: alternar empresa? comparar com semana anterior? marcar anomalia?
