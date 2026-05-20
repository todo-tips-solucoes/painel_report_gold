"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, Users, AlertTriangle, ArrowRightLeft, CheckCircle2, Clock, CircleSlash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KpiCard } from "@/components/kpi-card";
import { Badge } from "@/components/ui/badge";
import { useIframeParams } from "@/components/iframe-context";
import { HorizontalBars } from "@/components/charts/horizontal-bar";
import {
  FreshnessIndicator,
  useFreshnessClock,
  STALE_THRESHOLD_MS,
} from "@/components/freshness-indicator";
import {
  ReportErrorState,
  parseFetchError,
} from "@/components/report-error-state";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { PeriodChips } from "@/components/period-chips";
import { useCompany, companyLabel } from "@/components/use-company";
import { defaultRange } from "@/lib/date-presets";
import { fmtDuration, fmtNumber, fmtPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AtendimentoResponse } from "@/schemas/atendimento";

type StatusKind = "active" | "pending" | "closed";

function StatusCard({
  kind,
  value,
  total,
  help,
}: {
  kind: StatusKind;
  value: number;
  total: number;
  help: string;
}) {
  const def =
    kind === "active"
      ? {
          label: "Em atendimento",
          tone: "text-success",
          dot: "bg-success",
          icon: CheckCircle2,
          hint: "Tickets abertos sendo trabalhados agora.",
        }
      : kind === "pending"
        ? {
            label: "Aguardando",
            tone: "text-warning",
            dot: "bg-warning",
            icon: Clock,
            hint: "Tickets que ainda não receberam atendimento.",
          }
        : {
            label: "Fechados",
            tone: "text-muted-foreground",
            dot: "bg-foreground/40",
            icon: CircleSlash,
            hint: "Tickets finalizados no período selecionado.",
          };

  const ratio = total > 0 ? value / total : 0;
  const Icon = def.icon;

  return (
    <Card>
      <CardContent className="px-5 py-4">
        <div className="flex items-center gap-2">
          <span
            className={cn("inline-block h-2 w-2 rounded-full", def.dot)}
            aria-hidden
          />
          <span className="text-xs uppercase tracking-wide font-medium text-muted-foreground">
            {def.label}
          </span>
          <InfoTooltip label={def.label}>{help}</InfoTooltip>
        </div>
        <div className="mt-2 flex items-baseline gap-3">
          <span
            className={cn(
              "text-3xl font-semibold tabular-nums leading-none",
              def.tone,
            )}
          >
            {fmtNumber(value)}
          </span>
          {total > 0 && (
            <span className="text-sm tabular-nums text-muted-foreground">
              {fmtPercent(ratio, 1)}
            </span>
          )}
        </div>
        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
          <Icon className="h-3 w-3" aria-hidden />
          <span>{def.hint}</span>
        </div>
      </CardContent>
    </Card>
  );
}

type HeroPick =
  | { kind: "backlog"; value: number }
  | { kind: "ia"; pct: number }
  | { kind: "volume"; value: number };

function pickHero(data: AtendimentoResponse): HeroPick {
  if (data.conversao.pendingOlderThan24h > 50) {
    return { kind: "backlog", value: data.conversao.pendingOlderThan24h };
  }
  if (data.mode === "ia" && data.iaAttribution.totalTickets > 0) {
    return { kind: "ia", pct: data.iaAttribution.pct };
  }
  return { kind: "volume", value: data.ticketsInRange.total };
}

export default function AtendimentoPage() {
  const { companyId } = useIframeParams();
  const queryClient = useQueryClient();
  const [range, setRange] = React.useState(() => defaultRange());
  const { data: company } = useCompany(companyId);
  const label = companyLabel(company, companyId);

  const qs = `companyId=${companyId}&from=${range.from}&to=${range.to}`;
  const query = useQuery<AtendimentoResponse>({
    queryKey: ["atendimento", companyId, range.from, range.to],
    queryFn: async () => {
      const r = await fetch(`/api/kpis/atendimento?${qs}`);
      if (!r.ok) throw new Error(`Falha ${r.status}: ${await r.text()}`);
      return r.json();
    },
    staleTime: STALE_THRESHOLD_MS,
  });
  const { data, isLoading, isError, error, isFetching, dataUpdatedAt } = query;

  const checkStale = useFreshnessClock();
  const isStale = checkStale(dataUpdatedAt);

  const handleRefresh = React.useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["atendimento", companyId] });
  }, [queryClient, companyId]);

  if (isError && !data) {
    return (
      <ReportErrorState
        parsed={parseFetchError(error)}
        onRetry={handleRefresh}
        isRetrying={isFetching}
      />
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded bg-muted/60 motion-reduce:animate-none" />
          <div className="h-4 w-72 animate-pulse rounded bg-muted/40 motion-reduce:animate-none" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="h-24 animate-pulse bg-muted/40 motion-reduce:animate-none" />
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-12">
          <Card className="md:col-span-6">
            <CardContent className="h-32 animate-pulse bg-muted/40 motion-reduce:animate-none" />
          </Card>
          <Card className="md:col-span-3">
            <CardContent className="h-32 animate-pulse bg-muted/40 motion-reduce:animate-none" />
          </Card>
          <Card className="md:col-span-3">
            <CardContent className="h-32 animate-pulse bg-muted/40 motion-reduce:animate-none" />
          </Card>
        </div>
      </div>
    );
  }

  const isIa = data.mode === "ia";
  const filaBars = data.filas.slice(0, 10).map((f) => ({
    label: f.name,
    value: f.total,
    hint: `${f.closed} fechados · ${f.pending} pendentes`,
  }));
  const hero = pickHero(data);

  // Status em tempo real, inspirado no projeto original.
  // "Em atendimento" = tickets abertos não fechados = total - closed - pending (estimativa via dado disponível)
  // Como o schema atual só expõe closed e pending, "Em atendimento" aproxima como max(total - closed - pending, 0).
  const ativos = Math.max(
    data.ticketsInRange.total - data.ticketsInRange.closed - data.ticketsInRange.pending,
    0,
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Atendimento
            </h1>
            {isIa ? (
              <Badge variant="primary">
                <Bot className="h-3 w-3 mr-1" aria-hidden /> Modo IA
              </Badge>
            ) : (
              <Badge variant="success">
                <Users className="h-3 w-3 mr-1" aria-hidden /> Modo humano
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {companyId
              ? `${label} · ${fmtNumber(data.ticketsInRange.total)} tickets no período`
              : `${fmtNumber(data.ticketsInRange.total)} tickets no período`}
          </p>
        </div>
        <FreshnessIndicator
          updatedAt={dataUpdatedAt || null}
          isFetching={isFetching}
          isStale={isStale || (isError && !!data)}
          onRefresh={handleRefresh}
        />
      </header>

      <PeriodChips value={range} onChange={setRange} />

      {/* Banner explicativo modo IA */}
      {isIa && data.iaAttribution.totalTickets > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-start gap-3 py-4">
            <Bot className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden />
            <div className="text-sm">
              <strong>Operação 100% automatizada detectada.</strong>{" "}
              {data.iaAttribution.withUser === 0
                ? "Nenhum ticket atribuído a operador humano no período selecionado."
                : `Apenas ${fmtNumber(data.iaAttribution.withUser)} de ${fmtNumber(data.iaAttribution.totalTickets)} tickets (${fmtPercent(data.iaAttribution.pct)}) atribuídos a operador humano.`}{" "}
              As métricas abaixo refletem desempenho da automação.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status em tempo real (inspirado no dashboard antigo) */}
      <section>
        <h2 className="text-xs uppercase tracking-wide font-medium text-muted-foreground mb-3">
          Status dos atendimentos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatusCard
            kind="active"
            value={ativos}
            total={data.ticketsInRange.total}
            help="Tickets que não estão fechados nem aguardando: foram atendidos mas continuam em outro estado (snooze, transferência, etc)."
          />
          <StatusCard
            kind="pending"
            value={data.ticketsInRange.pending}
            total={data.ticketsInRange.total}
            help="Tickets que ainda não receberam a primeira resposta. Pendentes há mais de 24h são destacados separadamente abaixo."
          />
          <StatusCard
            kind="closed"
            value={data.ticketsInRange.closed}
            total={data.ticketsInRange.total}
            help="Tickets resolvidos e fechados no período selecionado."
          />
        </div>
      </section>

      {/* Linha hero + KPIs operacionais */}
      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-6">
          {hero.kind === "backlog" ? (
            <KpiCard
              variant="hero"
              label="Backlog acima de 24h"
              value={hero.value}
              tone="destructive"
              caption={`${fmtNumber(hero.value)} tickets aguardando resposta há mais de 24 horas. Priorizar antes de seguir as demais métricas.`}
              hint="O SLA implícito de atendimento foi excedido neste subconjunto."
              help="Tickets que permanecem pending por mais de 24h. É o sinal mais concreto de capacidade insuficiente ou fluxo travado."
            />
          ) : hero.kind === "ia" ? (
            <KpiCard
              variant="hero"
              label="Atribuição IA"
              value={fmtPercent(1 - hero.pct, 1)}
              tone="primary"
              caption={`${fmtPercent(1 - hero.pct, 1)} dos tickets passam pela automação sem operador humano no período.`}
              hint={`${fmtNumber(data.iaAttribution.totalTickets)} tickets analisados.`}
              help="Percentual de tickets processados sem atribuição a operador humano. Mede o quanto o fluxo de IA está absorvendo a operação."
            />
          ) : (
            <KpiCard
              variant="hero"
              label="Volume total no período"
              value={hero.value}
              tone="primary"
              caption={`${fmtNumber(hero.value)} tickets processados no período selecionado.`}
              hint={`${fmtNumber(data.ticketsInRange.closed)} fechados · ${fmtNumber(data.ticketsInRange.pending)} pendentes`}
              help="Soma de todos os tickets criados na operação dentro da janela escolhida, independente do status final."
            />
          )}
        </div>
        <div className="md:col-span-3">
          <KpiCard
            label="Tempo de resposta · mediana"
            value={fmtDuration(data.tprSample.medianSec)}
            tone={
              data.tprSample.medianSec == null
                ? "default"
                : data.tprSample.medianSec < 60
                  ? "success"
                  : data.tprSample.medianSec < 600
                    ? "default"
                    : "warning"
            }
            hint={
              data.tprSample.p90Sec != null
                ? `p90: ${fmtDuration(data.tprSample.p90Sec)} · base de ${fmtNumber(data.tprSample.n)} tickets`
                : `base de ${fmtNumber(data.tprSample.n)} tickets`
            }
            help="Tempo entre a mensagem do cliente e a primeira resposta da operação. Mediana representa o caso típico; p90 captura a cauda lenta."
          />
        </div>
        <div className="md:col-span-3">
          <KpiCard
            label="Taxa de fechamento"
            value={fmtPercent(data.conversao.closedRate, 1)}
            hint={`${fmtNumber(data.ticketsInRange.closed)} de ${fmtNumber(data.ticketsInRange.total)} fechados`}
            tone={data.conversao.closedRate < 0.5 ? "warning" : "success"}
            help="Percentual de tickets que foram fechados em relação ao total criado no período. Abaixo de 50% sinaliza acúmulo."
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por fila</CardTitle>
            <CardDescription>
              Volume de tickets em cada fila ativa dentro do período.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.semFila.pct > 0.1 && (
              <div className="mb-4 flex items-start gap-2 rounded-md border border-warning/30 bg-warning/5 p-3 text-sm">
                <AlertTriangle
                  className="h-4 w-4 text-warning mt-0.5 shrink-0"
                  aria-hidden
                />
                <div>
                  <strong>{fmtNumber(data.semFila.total)} tickets sem fila</strong>{" "}
                  ({fmtPercent(data.semFila.pct)}). Provavelmente fechados sem
                  passar por nenhuma fila, ou criados fora do fluxo.
                </div>
              </div>
            )}
            <HorizontalBars data={filaBars} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" aria-hidden />
              Escalonamento entre filas
              <InfoTooltip label="Escalonamento entre filas">
                Mede quantos tickets passaram por mais de uma fila no caminho.
                Alto escalonamento pode indicar fluxos de IA encaminhando para
                recall, follow-up, ou triagem incompleta na entrada.
              </InfoTooltip>
            </CardTitle>
            <CardDescription>
              Tickets transferidos entre filas no caminho até o fechamento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-3xl font-semibold text-primary tabular-nums">
                  {fmtPercent(data.escalonamento.pctEscalonamento)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  dos tickets foram escalonados
                </div>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span>Com escalonamento</span>
                  <span className="tabular-nums font-medium">
                    {fmtNumber(data.escalonamento.comEscalonamento)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Sem escalonamento</span>
                  <span className="tabular-nums">
                    {fmtNumber(data.escalonamento.semEscalonamento)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                  <span>Base com tracking</span>
                  <span className="tabular-nums">
                    {fmtNumber(data.escalonamento.totalWithTraking)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <KpiCard
        label="Backlog · pendentes há mais de 24h"
        value={data.conversao.pendingOlderThan24h}
        tone={data.conversao.pendingOlderThan24h > 100 ? "destructive" : "default"}
        hint={
          data.conversao.pendingOlderThan24h > 100
            ? "Volume crítico de backlog acumulado"
            : data.conversao.pendingOlderThan24h > 0
              ? "Backlog dentro de níveis manejáveis"
              : "Sem backlog acumulado no momento"
        }
        help="Tickets que continuam pendentes (sem primeira resposta) há mais de 24 horas. É o indicador mais direto de capacidade insuficiente."
      />

      <details className="rounded-lg border border-border bg-muted/30 px-5 py-3 text-sm text-muted-foreground">
        <summary className="cursor-pointer select-none font-medium text-foreground">
          O que estes termos significam?
        </summary>
        <dl className="mt-3 grid gap-x-8 gap-y-3 md:grid-cols-2">
          <div>
            <dt className="font-medium text-foreground">Ticket</dt>
            <dd>
              Cada atendimento aberto. Engloba todas as mensagens trocadas com o
              mesmo cliente numa mesma conversa.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Tempo de resposta (mediana)</dt>
            <dd>
              Tempo entre uma mensagem do cliente e a primeira resposta da
              operação. A mediana ignora picos extremos para representar o tempo
              típico.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">p90</dt>
            <dd>
              90% dos tickets foram respondidos mais rápido que este valor.
              Captura a cauda lenta sem mostrar o pior caso isolado.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Backlog</dt>
            <dd>
              Tickets pendentes (sem primeira resposta) há mais de 24 horas. É o
              indicador mais direto de capacidade insuficiente.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Escalonamento</dt>
            <dd>
              Tickets que passaram por mais de uma fila no caminho até o
              fechamento. Alto escalonamento sugere triagem incompleta na
              entrada ou fluxos de IA muito ramificados.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Modo IA</dt>
            <dd>
              Indicador automático: quando mais de 95% dos tickets do período não
              têm operador humano atribuído, a operação é classificada como
              automatizada.
            </dd>
          </div>
        </dl>
      </details>
    </div>
  );
}
