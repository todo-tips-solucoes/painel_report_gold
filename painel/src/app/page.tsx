"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KpiCard } from "@/components/kpi-card";
import { Badge } from "@/components/ui/badge";
import { useIframeParams } from "@/components/iframe-context";
import { VolumeLineChart } from "@/components/charts/volume-line";
import { HeatmapChart } from "@/components/charts/heatmap";
import {
  FreshnessIndicator,
  useFreshnessClock,
  STALE_THRESHOLD_MS,
} from "@/components/freshness-indicator";
import {
  ReportErrorState,
  parseFetchError,
} from "@/components/report-error-state";
import { PeriodChips } from "@/components/period-chips";
import { useCompany, companyLabel } from "@/components/use-company";
import { rangeLastNDays } from "@/lib/date-presets";
import { fmtDuration, fmtPercent, fmtNumber } from "@/lib/format";
import type { HomeResponse } from "@/schemas/home";

type HeroChoice =
  | { kind: "messages-lost"; value: number }
  | { kind: "connections-down"; active: number; total: number; problems: number }
  | { kind: "tickets-today"; value: number };

function pickHero(data: HomeResponse): HeroChoice {
  if (data.conexoes.active === 0) {
    return {
      kind: "connections-down",
      active: 0,
      total: data.conexoes.total,
      problems: data.conexoes.total,
    };
  }
  if (data.messagesLost30d > 0) {
    return { kind: "messages-lost", value: data.messagesLost30d };
  }
  return { kind: "tickets-today", value: data.tickets.today };
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded bg-muted/60 motion-reduce:animate-none" />
        <div className="h-4 w-72 animate-pulse rounded bg-muted/40 motion-reduce:animate-none" />
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="h-24 animate-pulse bg-muted/40 motion-reduce:animate-none" />
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="h-60 animate-pulse bg-muted/40 motion-reduce:animate-none" />
      </Card>
    </div>
  );
}

function Glossary() {
  return (
    <details className="rounded-lg border border-border bg-muted/30 px-5 py-3 text-sm text-muted-foreground">
      <summary className="cursor-pointer select-none font-medium text-foreground">
        O que estes termos significam?
      </summary>
      <dl className="mt-3 grid gap-x-8 gap-y-3 md:grid-cols-2">
        <div>
          <dt className="font-medium text-foreground">Ticket</dt>
          <dd>
            Um atendimento aberto. Engloba todas as mensagens trocadas com o mesmo cliente
            numa mesma conversa.
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Tempo de resposta (mediana)</dt>
          <dd>
            Tempo entre uma mensagem do cliente e a primeira resposta da operação. A
            mediana ignora picos extremos para representar o tempo típico.
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">p90</dt>
          <dd>
            90% dos atendimentos foram respondidos mais rápido que este valor. Captura a
            cauda lenta sem mostrar o pior caso isolado.
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Entrega de mensagens</dt>
          <dd>
            Percentual de mensagens que o provedor confirma como entregues. A leitura
            confirmada (subconjunto) indica quantas foram efetivamente abertas pelo
            destinatário.
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Mensagens perdidas</dt>
          <dd>
            Mensagens que a operação tentou enviar mas o provedor não conseguiu entregar.
            Causas típicas: número errado, aplicativo desinstalado, bloqueio do
            destinatário.
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Conexão padrão</dt>
          <dd>
            Conexão marcada como padrão recebe atendimentos novos automaticamente quando
            o cliente não escolhe outro canal.
          </dd>
        </div>
      </dl>
    </details>
  );
}

export default function HomePage() {
  const { companyId } = useIframeParams();
  const queryClient = useQueryClient();
  const { data: company } = useCompany(companyId);
  const label = companyLabel(company, companyId);
  // Default 30d para os gráficos. Os KPIs do topo (Tickets hoje/7d/30d, TMA,
  // delivery, conexões, mensagens perdidas) ignoram o filtro — são leituras
  // de estado fixas que o usuário aprende a comparar entre si.
  const [range, setRange] = React.useState(() => rangeLastNDays(30));

  const qs = `companyId=${companyId}&from=${range.from}&to=${range.to}`;
  const query = useQuery<HomeResponse>({
    queryKey: ["home", companyId, range.from, range.to],
    queryFn: async () => {
      const r = await fetch(`/api/kpis/home?${qs}`);
      if (!r.ok) throw new Error(`Falha ${r.status}: ${await r.text()}`);
      return r.json();
    },
    staleTime: STALE_THRESHOLD_MS,
  });
  const { data, isLoading, isError, error, isFetching, dataUpdatedAt } = query;

  const handleRefresh = React.useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["home", companyId] });
  }, [queryClient, companyId]);

  const checkStale = useFreshnessClock();
  const isStale = checkStale(dataUpdatedAt);

  if (isError) {
    return (
      <ReportErrorState
        parsed={parseFetchError(error)}
        onRetry={handleRefresh}
        isRetrying={isFetching}
      />
    );
  }

  if (isLoading || !data) {
    return <LoadingSkeleton />;
  }

  const conexoesProblems = data.conexoes.total - data.conexoes.active;
  const tmaTone =
    data.tma.medianSec == null
      ? "default"
      : data.tma.medianSec < 60
        ? "success"
        : data.tma.medianSec < 600
          ? "default"
          : "warning";
  const hero = pickHero(data);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Visão geral
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {companyId
              ? `${label} · resumo dos últimos 30 dias`
              : "Resumo dos últimos 30 dias"}
          </p>
        </div>
        <div className="text-xs">
          <FreshnessIndicator
            updatedAt={dataUpdatedAt || null}
            isFetching={isFetching}
            isStale={isStale}
            onRefresh={handleRefresh}
          />
        </div>
      </header>

      <PeriodChips
        value={range}
        onChange={setRange}
        hint="afeta apenas os gráficos abaixo"
      />

      {/* Linha 1 — hero + dois apoios */}
      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-6">
          {hero.kind === "messages-lost" ? (
            <KpiCard
              variant="hero"
              label="Mensagens perdidas (30d)"
              value={hero.value}
              tone="destructive"
              caption={
                hero.value === 1
                  ? "1 mensagem enviada pela operação não chegou ao destinatário nos últimos 30 dias."
                  : `${fmtNumber(hero.value)} mensagens enviadas pela operação não chegaram ao destinatário nos últimos 30 dias.`
              }
              hint="Acompanhar a tendência ajuda a identificar provedor ou número instável."
              help="Mensagens enviadas que o provedor (WhatsApp/SMS) não conseguiu entregar. Causas comuns: número incorreto, aplicativo desinstalado, ou bloqueio do destinatário."
            />
          ) : hero.kind === "connections-down" ? (
            <KpiCard
              variant="hero"
              label="Conexões ativas"
              value={`${hero.active} / ${hero.total}`}
              tone="destructive"
              caption="Nenhuma conexão está online agora. Atendimentos novos não chegam até alguém reconectar."
              hint="Reconectar antes de seguir analisando os demais indicadores."
              help="Quantas integrações com WhatsApp ou outros canais estão online no momento. Se todas caem, novas conversas param de entrar."
            />
          ) : (
            <KpiCard
              variant="hero"
              label="Tickets hoje"
              value={hero.value}
              tone="primary"
              caption="Atendimentos abertos hoje. O número cresce ao longo do dia."
              hint={`Comparar com 7 dias (${fmtNumber(data.tickets.last7d)}) e 30 dias (${fmtNumber(data.tickets.last30d)}) abaixo.`}
              help="Total de atendimentos abertos desde a meia-noite. Inclui mensagens recebidas via WhatsApp e outros canais conectados."
            />
          )}
        </div>
        <div className="md:col-span-3">
          <KpiCard
            label="Tickets · 7 dias"
            value={data.tickets.last7d}
            hint="Total acumulado"
            help="Soma de atendimentos abertos nos últimos 7 dias corridos, incluindo hoje."
          />
        </div>
        <div className="md:col-span-3">
          <KpiCard
            label="Tickets · 30 dias"
            value={data.tickets.last30d}
            hint="Total acumulado"
            help="Soma de atendimentos abertos nos últimos 30 dias corridos, incluindo hoje."
          />
        </div>
      </div>

      {/* Linha 2 — indicadores operacionais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {hero.kind !== "messages-lost" && (
          <KpiCard
            label="Mensagens perdidas (30d)"
            value={data.messagesLost30d}
            tone={data.messagesLost30d > 0 ? "destructive" : "success"}
            hint={
              data.messagesLost30d === 0
                ? "Todas entregues"
                : "Verificar provedor"
            }
            help="Mensagens enviadas pela operação que o provedor não conseguiu entregar nos últimos 30 dias."
          />
        )}
        <KpiCard
          label="Tempo de resposta · mediana (30d)"
          value={fmtDuration(data.tma.medianSec)}
          hint={
            data.tma.p90Sec != null
              ? `p90: ${fmtDuration(data.tma.p90Sec)} · base de ${fmtNumber(data.tma.sampleSize)} atendimentos`
              : `Base de ${fmtNumber(data.tma.sampleSize)} atendimentos`
          }
          tone={tmaTone}
          help="Tempo entre uma mensagem do cliente e a primeira resposta da operação. A mediana representa o caso típico; p90 mostra a cauda lenta."
        />
        <KpiCard
          label="Entrega de mensagens (30d)"
          value={fmtPercent(data.delivery.rateAck3plus, 1)}
          hint={`Leitura confirmada: ${fmtPercent(data.delivery.rateAck4, 1)} · base de ${fmtNumber(data.delivery.sampleSize)} mensagens`}
          help="Percentual de mensagens enviadas que o provedor confirmou como entregues. A leitura confirmada (acima) é o subconjunto que o destinatário efetivamente abriu."
        />
        {hero.kind !== "connections-down" && (
          <KpiCard
            label="Conexões ativas"
            value={`${data.conexoes.active} / ${data.conexoes.total}`}
            hint={
              conexoesProblems > 0
                ? `${conexoesProblems} com falha`
                : "Todas online"
            }
            tone={conexoesProblems > 0 ? "warning" : "success"}
            help="Quantas integrações com WhatsApp ou outros canais estão online no momento."
          />
        )}
        <KpiCard
          label="Conexão padrão"
          value={
            data.conexoes.activeNames.length === 0
              ? "—"
              : `${data.conexoes.activeNames.length}`
          }
          tone={data.conexoes.activeNames.length === 0 ? "destructive" : "default"}
          hint={
            data.conexoes.activeNames.length === 0
              ? "Nenhuma conexão online"
              : data.conexoes.activeNames.length > 3
                ? `+${data.conexoes.activeNames.length - 3} além das mostradas`
                : undefined
          }
          help="Conexão marcada como padrão recebe os atendimentos novos automaticamente quando o cliente não escolhe outro canal."
        >
          {data.conexoes.activeNames.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {data.conexoes.activeNames.slice(0, 3).map((n) => (
                <Badge
                  key={n}
                  variant="success"
                  className="max-w-[14ch] truncate"
                  title={n}
                >
                  {n}
                </Badge>
              ))}
            </div>
          )}
        </KpiCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Volume diário</CardTitle>
          <CardDescription>
            Tickets criados a cada dia nos últimos 30 dias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VolumeLineChart data={data.volumeDaily} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Picos por dia da semana e hora</CardTitle>
          <CardDescription>
            Onde caem os atendimentos nos últimos 28 dias. Útil para dimensionar
            plantão.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HeatmapChart data={data.heatmap} />
        </CardContent>
      </Card>

      <Glossary />
    </div>
  );
}
