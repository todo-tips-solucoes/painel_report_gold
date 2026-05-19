---
name: Painel de Relatórios — CLIENTE_X
description: Sistema visual para painel multi-tenant de chat/CRM em saúde. Documenta o estado atual (herdado de shadcn/Tailwind) e a direção alvo (Stripe + Notion).
colors:
  primary: "#2563eb"
  primary-foreground: "#f7fafc"
  background: "#ffffff"
  foreground: "#0f172a"
  muted: "#f1f5f9"
  muted-foreground: "#64748b"
  border: "#e3e6ec"
  success: "#16a34a"
  warning: "#f59e0b"
  destructive: "#ef4444"
typography:
  display:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.005em"
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.04em"
rounded:
  sm: "0.25rem"
  md: "0.375rem"
  lg: "0.5rem"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  "2xl": "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "36px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "#1d4ed8"
    textColor: "{colors.primary-foreground}"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "36px"
  button-outline-hover:
    backgroundColor: "{colors.muted}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "36px"
  card-default:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.lg}"
    padding: "16px 20px"
  input-default:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "36px"
    typography: "{typography.body}"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
    typography: "{typography.body}"
  nav-link-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
  badge-primary:
    backgroundColor: "#dbeafe"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
    typography: "{typography.label}"
  table-header:
    backgroundColor: "#f1f5f9b3"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
    height: "40px"
---

# Design System: Painel de Relatórios

## 1. Overview

**Creative North Star: "The Clinical Ledger"**

Um livro-razão clínico digital: a precisão tabular de um dashboard financeiro (Stripe) combinada com a generosidade espacial e o tom calmo de um documento de trabalho profissional (Notion). O painel não busca encantar — busca tornar o estado da operação **legível em segundos**, sem jargão e sem decoração que compita com o dado.

O sistema rejeita explicitamente três caminhos: o **template SaaS azul-índigo padrão** (sidebars Bootstrap/AdminLTE, badges coloridos genéricos), o **clichê médico/clínico** (azul-branco-verde-cruz hospitalar), e o **BI corporativo** (grade infinita de cards idênticos onde nada hierarquiza). Quando dois caminhos parecem aceitáveis, escolher o mais sóbrio.

**Estado atual vs. alvo.** Este DESIGN.md documenta o sistema como ele existe hoje (herdado dos defaults Tailwind/shadcn — paleta blue-600 + slate, tipografia system-ui, layout flat). É honesto sobre o ponto de partida: a paleta de hoje é exatamente o que o PRODUCT.md lista como anti-referência. Os Named Rules e a seção Do's & Don'ts marcam onde o sistema atual desvia da intenção e em que direção evoluir.

**Key Characteristics:**
- Light theme único; sem dark mode no produto atual.
- Sans-serif system stack (sem fonte custom carregada ainda).
- Flat-by-default: apenas `shadow-sm` em cards e inputs; sem elevação dramática.
- Densidade média: cards com `px-5 py-4`, gaps moderados, texto base 14px.
- Hierarquia tipográfica modesta hoje (`text-3xl` em KPI → `text-base` em título → `text-xs` em rótulo); precisa de mais contraste de escala.
- Cor utilitária por status (success/warning/destructive) presente; uso em ≤5% da tela.

## 2. Colors

A paleta atual herda os defaults shadcn/Tailwind: `blue-600` como primária, ramp `slate` como neutros. É funcional, acessível e completamente genérica — qualquer SaaS de 2023 a usa. Os Named Rules abaixo registram a regra de uso atual; a evolução planejada está nas Do's & Don'ts.

### Primary
- **Telemetry Blue** (`#2563eb` / `hsl(221 83% 53%)` / `oklch(54% 0.22 264)`): cor de ação e de identidade. Aparece em botões primários, link ativo da nav, ícones de afirmação, contorno de foco de input, e no token `{params.companyId}` do header. **Atualmente usada além do limite saudável de 10% — herdada do default shadcn.**

### Neutral
- **Paper White** (`#ffffff` / `hsl(0 0% 100%)`): fundo de página e fundo de card. **Branco puro é uma violação ativa da regra de tintar neutros pela hue da marca; a evolução pede `oklch(99% 0.003 264)` (branco-osso com tinta azul leve).**
- **Ink Slate** (`#0f172a` / `hsl(222 47% 11%)` / `oklch(20% 0.04 264)`): cor de texto corpo e título. Quase-preto azulado, alto contraste sobre Paper White (AAA).
- **Mist** (`#f1f5f9` / `hsl(210 40% 96%)`): segundo plano para zonas calmas — fundo de header de tabela (em `bg-muted/50`), hover de botão ghost/outline, contraste sutil entre regiões.
- **Slate Mid** (`#64748b` / `hsl(215 16% 47%)`): texto secundário, rótulos, datas, captions. AA sobre Paper White.
- **Hairline** (`#e3e6ec` / `hsl(220 13% 91%)`): borda de card, divisor de tabela, contorno de input em repouso. Espessura sempre 1px.

### Status
- **Confirm Green** (`#16a34a` / `hsl(142 71% 45%)`): variação positiva, conversão, KPI em alta.
- **Caution Amber** (`#f59e0b` / `hsl(38 92% 50%)`): atenção, fora da meta, espera.
- **Alert Red** (`#ef4444` / `hsl(0 84% 60%)`): falha, queda relevante, ação destrutiva.

### Named Rules

**The One Accent Rule.** Telemetry Blue carrega o papel de cor de ação. Em qualquer tela isolada, sua presença total não deve passar de 10% da área visível. Hoje o uso excede esse limite (header company-id + nav-link-active + botões primários disputam atenção); a meta é reduzir.

**The Status Trio Rule.** Confirm Green, Caution Amber e Alert Red existem **só** para variação/estado de dado. Nunca decorativos, nunca em fundos cheios, nunca em texto de seção. Apenas em: pequeno indicador numérico, ícone de delta, badge tonal (`bg-color/10 text-color border-color/20`).

**The Cool-Tinted Neutral Rule.** Todos os cinzas são azulados (`slate`), não verdadeiros (`gray`). Misturar grays neutros com slates produz cinzas "sujos". Sempre slate.

## 3. Typography

**Display / Body / Label Font:** `ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` (stack default do Tailwind preflight).

**Mono / Tabular Font:** sem fonte mono dedicada; números financeiros usam `tabular-nums` sobre a sans (`font-variant-numeric: tabular-nums`) — visto no `KpiCard`.

**Character.** Funcional, alta legibilidade, zero personalidade. A stack do sistema entrega bem em qualquer SO e em embed via iframe — mas não diferencia o painel de nenhum outro. Uma fonte com identidade (Inter Display, Söhne, Tiempos Text + Inter) é a próxima alavanca de marca, sem prejuízo das regras abaixo.

### Hierarchy

- **Display** (`600`, `1.875rem` / 30px, `line-height: 1.1`, `letter-spacing: -0.01em`): valor principal do `KpiCard` (`text-3xl font-semibold tabular-nums`). Sempre com `tabular-nums` quando representar número.
- **Title** (`600`, `1rem` / 16px, `line-height: 1`, `letter-spacing: -0.005em`): `CardTitle`. Compactos, sem hierarquia interna.
- **Body** (`400`, `0.875rem` / 14px, `line-height: 1.45`): texto base; tudo que não é label, título ou KPI. Cap natural de linha em ~70ch.
- **Label** (`500`, `0.75rem` / 12px, `letter-spacing: 0.04em`, UPPERCASE): rótulo de KPI, header de tabela (`Th`), level de usuário no header. **A única autorização de uppercase** no sistema.

### Named Rules

**The Scale Gap Rule.** Entre dois níveis adjacentes, o ratio mínimo é 1.25. Display/Title hoje pula direto 30→16 (ratio ~1.9, excelente). Title/Body pula 16→14 (ratio 1.14 — abaixo do mínimo). Solução: subir Title para 18px ou abaixar Body para 13px em superfícies de leitura densa. **Não introduzir Headline intermediária só para preencher a escada.**

**The Tabular-Nums Rule.** Qualquer número que apareça em coluna, série temporal, KPI ou linha de tabela usa `font-variant-numeric: tabular-nums`. Sem exceção. Larguras desiguais de dígitos em série numérica é amadorismo visual.

**The Single-Case Rule.** Title Case nunca. UPPERCASE só em rótulo (label) e em status técnico (level do usuário). Tudo o mais é sentence case.

## 4. Elevation

Sistema **flat-por-padrão**. A profundidade existe pela hierarquia tipográfica e por mudanças sutis de fundo (Paper White → Mist), não por sombras dramáticas. Sombras existem em duas situações apenas: uma sombra de definição em cards e inputs em repouso (`shadow-sm`), e um ring de foco em inputs interativos.

### Shadow Vocabulary

- **Definition** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`): aplicada em cards e inputs em repouso. Tão leve que age mais como "ainda assim isso é uma superfície" do que como elevação.
- **Focus Ring** (`box-shadow: 0 0 0 2px #2563eb`): equivalente a `focus-visible:ring-2 ring-primary`. Único elemento elevado por interação; sinaliza foco de teclado.

### Named Rules

**The Flat-By-Default Rule.** Superfícies são planas em repouso. Sombra densa, blur agressivo ou `backdrop-filter` em estado padrão são proibidos. A profundidade que importa é a hierarquia da informação, não a profundidade física simulada.

**The No-Drop-Shadow Rule.** Sombras grandes (`shadow-md`, `shadow-lg`, `shadow-xl` do Tailwind) não fazem parte do vocabulário. Se um elemento precisa "flutuar", reavaliar o layout — geralmente é sintoma de falta de hierarquia, não falta de sombra.

## 5. Components

### Buttons

Botões são **discretos, com forma de pílula leve** (`rounded-md` = 6px) e **altura compacta** (36px default). Não chamam atenção por si — comunicam ação possível. Existem em quatro variantes; todas com mesma forma, divergindo só por preenchimento.

- **Shape:** `border-radius: 0.375rem` (6px), `height: 36px` (`md`), padding horizontal 16px. Variantes de tamanho: `sm` (32px alto, 12px padding), `lg` (40px alto, 24px padding), `icon` (36×36 quadrado).
- **Primary:** fundo Telemetry Blue, texto Paper White ajustado; hover escurece para `hsl(221 83% 47%)` (`bg-primary/90`).
- **Outline:** fundo Paper White, borda Hairline 1px, texto Ink Slate; hover muda fundo para Mist.
- **Ghost:** sem fundo, sem borda, só texto; hover ganha fundo Mist.
- **Destructive:** fundo Alert Red, texto branco; reservado para ações irreversíveis (deletar, expurgar). **Não usar para "cancelar".**
- **Focus:** todas as variantes herdam `focus-visible:outline-none focus-visible:ring-2 ring-primary` (ainda não explícito no `Button`, recomendado adicionar).

### Cards / Containers

- **Corner Style:** `border-radius: 0.5rem` (8px) — único elemento com `lg` no sistema; reforça o card como zona discretamente delimitada.
- **Background:** Paper White.
- **Shadow Strategy:** apenas `Definition` (`shadow-sm`) — ver Elevation.
- **Border:** 1px Hairline.
- **Internal Padding:** `CardContent` usa `px-5 py-4` (20×16); `CardHeader` mesma medida com `border-b` Hairline separando do conteúdo.

### KPI Card (signature)

O componente assinatura do painel. Estrutura fixa em três níveis verticais que materializa o princípio "hierarquia opinativa":

1. **Rótulo** (Label uppercase, 12px, Slate Mid) — diz **o que é**.
2. **Valor** (Display 30px, semibold, tabular-nums, tone color) — diz **quanto é**.
3. **Contexto opcional** (Body 12px, Slate Mid) — proporção e/ou dica.

A cor do valor responde a uma `tone` semântica (`default | primary | success | warning | destructive`). **Tone não decora — informa estado.** Um KPI em `success` está acima de meta; em `warning`, abaixo; em `default`, neutro/contextual. Misturar tone como ornamento é abuso da regra.

### Inputs / Fields

- **Style:** altura 36px, padding 12px lateral, borda 1px Hairline, fundo Paper White, texto Body, placeholder Slate Mid.
- **Shape:** `rounded-md` (6px), igual ao botão.
- **Focus:** outline removido, `ring-2 ring-primary` aplicado via `box-shadow` — Telemetry Blue como anel; sem mudança de borda.
- **Disabled:** `opacity: 0.5`, cursor `not-allowed`.
- **Error/Success:** ainda não há tratamento dedicado; quando introduzir, herdar Alert Red / Confirm Green em borda + texto helper abaixo, nunca em fundo.

### Badges

Pílulas pequenas (`rounded-full`, 2px×8px), `text-xs font-medium`. Tonais por padrão: fundo na cor do papel a 10% (`/10`), borda a 20% (`/20`), texto na cor cheia. Cinco variantes: `default` (cinza), `primary`, `success`, `warning`, `destructive`. Uso correto: status de linha, marcador de origem, marcador de estado. Uso errado: decoração de seção, "novo!", contagem grande.

### Tables (signature)

Tabela é cidadã de primeira classe — o painel **lê tabelas** mais do que qualquer outra coisa. Vocabulário consistente em `Table/THead/TBody/Tr/Th/Td`:

- **Header (`Th`):** altura 40px, fundo `bg-muted/50` (Mist a ~50%), texto Label uppercase Slate Mid. Sinaliza "isto não é dado, é classificação".
- **Row (`Tr`):** borda inferior Hairline, hover `bg-muted/30` (Mist a ~30%) — feedback discreto.
- **Cell (`Td`):** padding 12px lateral, 8px vertical, `align-top` (linhas multi-linha não rolam para o centro).
- **Última linha:** sem borda (`[&_tr:last-child]:border-0`).
- **Body (`Tbody`):** texto Body, alinhamento à esquerda exceto colunas numéricas (que devem receber `tabular-nums text-right`).

### Navigation

- **App-Shell Header:** uma faixa fina no topo, fundo Paper White, borda inferior Hairline 1px. Identidade do tenant à esquerda (`Empresa #N` com `N` em Telemetry Blue), nav inline no meio, usuário e nível à direita em texto Label.
- **Nav Link (`nav-link`):** texto Body, padding `6px 12px`, `rounded-md`. Estado default: texto Slate Mid, sem fundo. Hover: fundo Mist. **Active: fundo Telemetry Blue, texto Paper White** (variante `nav-link-active`) — atualmente é a maior mancha de cor primária na tela.
- **Mobile:** wrap natural via `flex-wrap gap-1`; sem drawer dedicado ainda.

## 6. Do's and Don'ts

### Do:

- **Do** usar Telemetry Blue como cor de ação, não de identidade decorativa. Botões primários, link ativo, ring de foco — pare aí.
- **Do** aplicar `tabular-nums` em todo número que apareça em série, KPI, coluna ou linha de tabela. Sem exceção.
- **Do** manter `shadow-sm` como a única sombra do vocabulário em repouso. Use ring de foco como única elevação interativa.
- **Do** usar Status Trio (`success`/`warning`/`destructive`) **apenas** para sinalizar estado de dado: variação, conversão, alerta operacional.
- **Do** acompanhar cor de status com forma ou rótulo (seta, sinal, palavra). Daltonismo vermelho-verde é o caso mais comum no público gestor.
- **Do** preferir hierarquia tipográfica (peso + tamanho) para criar foco. O `KpiCard` é o modelo: rótulo pequeno, valor grande, contexto pequeno.
- **Do** registrar densidade controlada: `gap-4` entre KPIs, `gap-6` entre seções, `gap-2` dentro de um agrupamento próximo.
- **Do** garantir foco visível por teclado em **todo** elemento interativo — `focus-visible:ring-2 ring-primary` é o padrão.
- **Do** projetar com a hipótese "este painel está dentro de um iframe": tipografia, contraste e tamanhos clicáveis precisam funcionar sob zoom/tema externo.

### Don't:

- **Don't** parecer um **template SaaS Bootstrap/AdminLTE**: sidebar azul-índigo cheia, ícones genéricos lucide sem propósito, badges coloridos em cada linha, sombras médias por reflexo. É o "AI slop" mais comum do domínio.
- **Don't** parecer um **clichê médico/clínico**: azul-claro + branco + verde-saúde + ícone de cruz/estetoscópio. O público é gestor de clínica, não paciente.
- **Don't** parecer **BI corporativo genérico** (Power BI/Tableau cru): grade de cards idênticos, três gráficos competindo por atenção, sensação de planilha colorida.
- **Don't** usar **gradientes** (especialmente roxo/rosa), **glassmorphism**, **glow neon**, **gradient text** ou qualquer recurso de "marketing AI-hype". Contradiz seriedade do dado clínico.
- **Don't** usar `#000` ou `#fff` puros em código novo. Tinte qualquer neutro pela hue azul da marca (chroma 0.005–0.01 em OKLCH é suficiente). *Migração: trocar `background: hsl(0 0% 100%)` por `oklch(99% 0.003 264)`.*
- **Don't** usar `border-left` ou `border-right` maior que 1px como faixa de cor em card, linha de lista, alerta ou callout. Banido.
- **Don't** empilhar cards dentro de cards. Card aninhado é sempre um erro de layout — refatorar.
- **Don't** criar uma grade de cards visualmente idênticos. Se há 6 KPIs, no mínimo o principal recebe Display maior, posição em destaque ou ocupa duas colunas.
- **Don't** usar Status colors (success/warning/destructive) como decoração de marca, fundo de seção, divisor ou ícone genérico. Status é status, não tema.
- **Don't** usar **em dash** (`—`) em copy. Use vírgula, dois pontos, ponto, parênteses. (Esta regra do impeccable vale também aqui.)
- **Don't** animar propriedades de layout (`width`, `height`, `top`, `left`, `margin`). Use `transform` e `opacity`. Easing exponencial ease-out, nunca bounce/elastic.
- **Don't** assumir hover como único caminho para affordance — operadores em tablet de clínica não têm hover.
- **Don't** introduzir uma fonte custom sem revisar a hierarquia da escada inteira: trocar o font-family sem refazer pesos e tamanhos quebra o ritmo.
