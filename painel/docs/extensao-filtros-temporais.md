# Extensão: filtros temporais nas demais páginas

Hoje só `/por-origem` aceita `from`/`to`. As outras 4 páginas (`/`, `/atendimento`, `/conexoes`, `/pipeline`) usam janelas **fixas** dentro do BFF (geralmente 30 dias). Este doc descreve o que mexer para que elas aceitem o mesmo conjunto de presets temporais.

## O que já existe (reusável sem refactor)

- `src/lib/date-presets.ts` — 7 presets + `matchPreset()` + `defaultRange()`. Pronto, agnóstico de página.
- Os chips em `src/components/por-origem/filters.tsx` (`PRESETS.map(...)`) — extrair para componente compartilhado quando começar a 2ª página. Sugestão: `src/components/period-chips.tsx`.

## Plano por página

### Comum a todas

1. **Mover os chips** para `src/components/period-chips.tsx`. Assinatura:
   ```ts
   type Props = {
     value: { from: string; to: string };
     onChange: (range: { from: string; to: string }) => void;
     compact?: boolean;
   };
   ```
2. **Cada `*.schema.ts`** ganha `from` e `to` opcionais com fallback no servidor:
   ```ts
   from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
   to:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
   ```
3. **Cada `lib/<feature>.ts`** aplica o filtro nos queries PostgREST:
   - Substituir os "últimos 30 dias" hardcoded por `q.from ?? defaultFrom()` e `q.to ?? defaultTo()`.
   - Cache key passa a incluir `from`/`to`.
4. **Cada `app/<rota>/page.tsx`**:
   - State local `[range, setRange]` inicializado com `defaultRange()`.
   - `<PeriodChips>` no header (ou ao lado do `FreshnessIndicator`).
   - `queryKey` inclui `range`.
   - `qs` passa `from`/`to` para o BFF.

### Especificidades por página

**`/` (Home)** — pulso geral

- `home.ts` calcula múltiplas janelas (`tickets.today`, `tickets.last7d`, `tickets.last30d`, `messagesLost30d`, `tma.medianSec` em 30d, etc).
- O filtro temporal **não substitui** essas janelas fixas — adiciona uma janela "customizada" que pode coexistir.
- Decisão de design: ou (a) o filtro **só afeta o gráfico de volume diário e o heatmap**, ou (b) reordena toda a Home conforme o período. Sugestão: começar com (a), menos invasivo.

**`/atendimento`** — recorte operacional

- `atendimento.ts` opera quase tudo em 30d (`tickets30d`, `tprSample 30d`, `filas 30d`, `escalonamento`).
- Renomear campos ou parametrizar: `tickets30d` → `ticketsInRange`, ajustar UI.
- Status Cards (Em atendimento/Aguardando/Fechados) já são **estado instantâneo** — não devem mudar com período. Manter separados visualmente do bloco filtrável.

**`/conexoes`** — status por canal · **NÃO ESTENDIDA (decisão)**

- Status atual é instantâneo (online/offline). **Não** depende de período.
- `volume24h/7d/30d` são fixos por design (mostra carga relativa em 3 escalas comparáveis).
- `tmaMedianSec` e `messagesLost30d` por canal são janelas fixas.
- Adicionar PeriodChips aqui criaria confusão: o user veria volume24h e volume30d (fixos) + messagesLost (variável). Inconsistente.
- **Decisão**: manter `/conexoes` sem PeriodChips. A página é um snapshot operacional, não um relatório analítico.

**`/pipeline`** — funil comercial

- `pipeline.ts` retorna `oportunidades` (sem janela atual — pega tudo).
- Adicionar `from`/`to` filtraria por `Oportunidades.createdAt`.
- Defaults: para uma operação subutilizada (<5 oportunidades), filtrar pode esconder ainda mais. Considerar não filtrar quando subutilizado e exibir disclaimer.

## Ordem sugerida de implementação

1. **Extrair `<PeriodChips>` compartilhado** (~30 min, isolado).
2. **`/atendimento`** primeiro — domínio mais óbvio para filtro temporal, schema mais simples para adaptar.
3. **`/pipeline`** — schema simples, valor analítico claro.
4. **Home** — mais complexa, decidir se filtro coexiste com janelas fixas ou substitui.
5. **`/conexoes`** — provavelmente pular; manter status instantâneo + volumes 24h/7d/30d.

## Riscos

- **Cache do BFF** (`src/lib/cache.ts`) hoje usa chaves baseadas em filtros existentes. Adicionar `from`/`to` à chave **explode o número de entradas**. Considerar TTL mais curto ou cache por janela.
- **PostgREST** com janelas estreitas pode ser **mais rápido** que 30d (menos rows), mas com janelas amplas (>90d) é potencialmente mais lento. Usar `pgrstGetAllPaginated` com `concurrency: 6` mitiga.
- **URL sync** dos filtros já é uma melhoria desejada para `/por-origem` (registrada em critique). Vale fazer junto se for atacar este escopo.

## Não-objetivos

- Esta extensão **não inclui** comparar com período anterior (delta vs baseline). É outra feature; KpiCard já tem prop `delta` pronta, falta o BFF expor baseline.
