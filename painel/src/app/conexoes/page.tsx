"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, AlertTriangle, XCircle, QrCode, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KpiCard } from "@/components/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, Th, Tr, Td } from "@/components/ui/table";
import { Pagination } from "@/components/pagination";
import { Select } from "@/components/ui/select";
import { useIframeParams } from "@/components/iframe-context";
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
import { fmtDuration, fmtNumber, fmtDateTime } from "@/lib/format";
import type { ConexoesResponse, ConexaoRow } from "@/schemas/conexoes";

const PAGE_SIZES = [10, 25, 50, 100];

type StatusKey = "CONNECTED" | "qrcode" | "DISCONNECTED" | string | null;

function statusBadge(status: StatusKey, removido: boolean) {
  if (removido) return <Badge>removido</Badge>;
  if (status === "CONNECTED")
    return (
      <Badge variant="success">
        <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden /> conectado
      </Badge>
    );
  if (status === "qrcode")
    return (
      <Badge variant="warning">
        <QrCode className="h-3 w-3 mr-1" aria-hidden /> aguardando QR
      </Badge>
    );
  if (status === "DISCONNECTED")
    return (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" aria-hidden /> desconectado
      </Badge>
    );
  return (
    <Badge>
      <AlertTriangle className="h-3 w-3 mr-1" aria-hidden />{" "}
      {status ?? "desconhecido"}
    </Badge>
  );
}

type HeroPick =
  | { kind: "all-down"; total: number }
  | { kind: "some-down"; down: number; total: number }
  | { kind: "messages-lost"; row: ConexaoRow }
  | { kind: "healthy"; activeRelevant: number; totalRelevant: number };

function pickHero(data: ConexoesResponse): HeroPick {
  if (data.summary.totalRelevant > 0 && data.summary.activeRelevant === 0) {
    return { kind: "all-down", total: data.summary.totalRelevant };
  }
  const down = data.summary.totalRelevant - data.summary.activeRelevant;
  if (down > 0) {
    return { kind: "some-down", down, total: data.summary.totalRelevant };
  }
  // Algum canal com mensagens perdidas significativas?
  const lostThreshold = 10;
  const worst = data.rows
    .filter((r) => !r.removido && r.messagesLost30d >= lostThreshold)
    .sort((a, b) => b.messagesLost30d - a.messagesLost30d)[0];
  if (worst) {
    return { kind: "messages-lost", row: worst };
  }
  return {
    kind: "healthy",
    activeRelevant: data.summary.activeRelevant,
    totalRelevant: data.summary.totalRelevant,
  };
}

export default function ConexoesPage() {
  const { companyId } = useIframeParams();
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);

  const query = useQuery<ConexoesResponse>({
    queryKey: ["conexoes", companyId],
    queryFn: async () => {
      const r = await fetch(`/api/kpis/conexoes?companyId=${companyId}`);
      if (!r.ok) throw new Error(`Falha ${r.status}: ${await r.text()}`);
      return r.json();
    },
    staleTime: STALE_THRESHOLD_MS,
  });
  const { data, isLoading, isError, error, isFetching, dataUpdatedAt } = query;

  const checkStale = useFreshnessClock();
  const isStale = checkStale(dataUpdatedAt);

  const handleRefresh = React.useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["conexoes", companyId] });
  }, [queryClient, companyId]);

  React.useEffect(() => {
    setPage(1);
  }, [pageSize]);

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
        <Card>
          <CardContent className="h-32 animate-pulse bg-muted/40 motion-reduce:animate-none" />
        </Card>
        <Card>
          <CardContent className="h-80 animate-pulse bg-muted/40 motion-reduce:animate-none" />
        </Card>
      </div>
    );
  }

  const downRelevant = data.summary.totalRelevant - data.summary.activeRelevant;
  const hero = pickHero(data);
  const totalLostMessages = data.rows.reduce(
    (a, r) => a + r.messagesLost30d,
    0,
  );

  const total = data.rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const visibleRows = data.rows.slice(startIdx, startIdx + pageSize);
  const start = total === 0 ? 0 : startIdx + 1;
  const end = Math.min(safePage * pageSize, total);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Conexões WhatsApp
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {companyId
              ? `Operação #${companyId} · status, carga e qualidade por canal`
              : "Status, carga e qualidade por canal"}
          </p>
        </div>
        <FreshnessIndicator
          updatedAt={dataUpdatedAt || null}
          isFetching={isFetching}
          isStale={isStale || (isError && !!data)}
          onRefresh={handleRefresh}
        />
      </header>

      {/* Alerta crítico se há conexões offline (inspirado nos "Alertas Ativos") */}
      {hero.kind === "all-down" && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertTriangle
              className="h-5 w-5 text-destructive mt-0.5 shrink-0"
              aria-hidden
            />
            <div className="text-sm">
              <strong>Nenhuma conexão está ativa agora.</strong> Atendimentos
              novos não chegam até alguém reconectar pelo menos uma instância
              das {hero.total} cadastradas.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hero condicional + KPIs de apoio */}
      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-6">
          {hero.kind === "all-down" ? (
            <KpiCard
              variant="hero"
              label="Conexões ativas"
              value={`0 / ${hero.total}`}
              tone="destructive"
              caption="Operação offline. Cada minuto sem conexão ativa significa atendimentos potenciais perdidos."
              hint="Reconectar antes de qualquer outra análise."
              help="Conexões marcadas como relevantes (não removidas) e que reportam status. Quando todas caem, novas conversas não entram."
            />
          ) : hero.kind === "some-down" ? (
            <KpiCard
              variant="hero"
              label="Conexões com falha"
              value={hero.down}
              tone="warning"
              caption={`${hero.down} de ${hero.total} canais estão fora do ar. Operação continua, mas com capacidade reduzida.`}
              hint="Detalhe na tabela abaixo: olhar coluna Status."
              help="Conexões que reportam status diferente de 'CONNECTED' (aguardando QR ou desconectadas). Mensagens podem estar atrasando."
            />
          ) : hero.kind === "messages-lost" ? (
            <KpiCard
              variant="hero"
              label="Canal com mais perdas"
              value={fmtNumber(hero.row.messagesLost30d)}
              tone="warning"
              caption={`${hero.row.name ?? "Canal sem nome"} acumulou ${fmtNumber(hero.row.messagesLost30d)} mensagens não entregues em 30 dias.`}
              hint="Verificar saúde do provedor desta instância antes que afete a operação."
              help="Mensagens enviadas que o provedor não conseguiu entregar. Causas comuns: número errado, app desinstalado, bloqueio do destinatário."
            />
          ) : (
            <KpiCard
              variant="hero"
              label="Conexões ativas"
              value={`${hero.activeRelevant} / ${hero.totalRelevant}`}
              tone="success"
              caption="Todas as conexões relevantes estão online e dentro de níveis saudáveis."
              hint={`${fmtNumber(data.summary.sumVolume30d)} mensagens processadas em 30 dias.`}
              help="Quantas integrações com WhatsApp ou outros canais estão ativas no momento."
            />
          )}
        </div>
        <div className="md:col-span-2">
          <KpiCard
            label="Volume total · 30d"
            value={data.summary.sumVolume30d}
            tone="primary"
            help="Total de mensagens enviadas e recebidas em todas as conexões relevantes nos últimos 30 dias."
          />
        </div>
        <div className="md:col-span-2">
          <KpiCard
            label="Mensagens perdidas · 30d"
            value={totalLostMessages}
            tone={totalLostMessages > 0 ? "warning" : "success"}
            hint={totalLostMessages === 0 ? "Tudo entregue" : "Verificar canais"}
            help="Soma de mensagens enviadas pela operação que o provedor não conseguiu entregar, somando todas as conexões."
          />
        </div>
        <div className="md:col-span-2">
          <KpiCard
            label="Cadastradas"
            value={data.summary.total}
            hint={
              data.summary.total - data.summary.totalRelevant > 0
                ? `${data.summary.total - data.summary.totalRelevant} removidas`
                : `${data.summary.totalRelevant} em uso`
            }
            help="Total de conexões cadastradas, incluindo removidas. Apenas as relevantes contam para os indicadores acima."
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de conexões</CardTitle>
          <CardDescription>
            Carga, tempo de resposta e perdas por canal nos últimos 30 dias.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <THead>
              <Tr>
                <Th>ID</Th>
                <Th>Nome</Th>
                <Th>Status</Th>
                <Th className="text-right">Vol. 24h</Th>
                <Th className="text-right">Vol. 7d</Th>
                <Th className="text-right">Vol. 30d</Th>
                <Th className="text-right">TMA mediana</Th>
                <Th className="text-right">Mensagens perdidas</Th>
                <Th>Última atualização</Th>
              </Tr>
            </THead>
            <TBody>
              {visibleRows.map((r) => (
                <Tr
                  key={r.id}
                  className={r.removido ? "opacity-50" : undefined}
                >
                  <Td className="tabular-nums">{r.id}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      {r.isDefault && (
                        <Star
                          className="h-3.5 w-3.5 text-warning"
                          aria-label="Conexão padrão"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="font-medium truncate" title={r.name ?? ""}>
                          {r.name || "sem nome"}
                        </div>
                        {r.number && (
                          <div className="text-xs text-muted-foreground tabular-nums">
                            {r.number}
                          </div>
                        )}
                      </div>
                    </div>
                  </Td>
                  <Td>{statusBadge(r.status, r.removido)}</Td>
                  <Td className="text-right tabular-nums">
                    {fmtNumber(r.volume24h)}
                  </Td>
                  <Td className="text-right tabular-nums">
                    {fmtNumber(r.volume7d)}
                  </Td>
                  <Td className="text-right tabular-nums font-medium">
                    {fmtNumber(r.volume30d)}
                  </Td>
                  <Td className="text-right tabular-nums">
                    {fmtDuration(r.tmaMedianSec)}
                  </Td>
                  <Td className="text-right tabular-nums">
                    {r.messagesLost30d > 0 ? (
                      <span className="text-destructive font-medium">
                        {fmtNumber(r.messagesLost30d)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </Td>
                  <Td className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                    {fmtDateTime(r.updatedAt)}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>

          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                {fmtNumber(start)}–{fmtNumber(end)} de {fmtNumber(total)} conexões
              </span>
              <span className="flex items-center gap-1.5">
                <span>Por página:</span>
                <Select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-8 w-[72px]"
                >
                  {PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </span>
            </div>
            <Pagination
              page={safePage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </CardContent>
      </Card>

      <details className="rounded-lg border border-border bg-muted/30 px-5 py-3 text-sm text-muted-foreground">
        <summary className="cursor-pointer select-none font-medium text-foreground">
          O que estes termos significam?
        </summary>
        <dl className="mt-3 grid gap-x-8 gap-y-3 md:grid-cols-2">
          <div>
            <dt className="font-medium text-foreground">Conexão relevante</dt>
            <dd>
              Conexão cadastrada que não foi removida e que reporta status. As
              cadastradas mas removidas continuam visíveis na tabela com opacidade
              reduzida, mas não contam para os indicadores agregados.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Status: conectado / aguardando QR / desconectado</dt>
            <dd>
              Conectado significa pronta para enviar e receber. Aguardando QR
              significa que o provedor pediu nova autenticação. Desconectado
              significa que o canal caiu e ainda não foi recuperado.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Volume 24h / 7d / 30d</dt>
            <dd>
              Total de mensagens (enviadas + recebidas) processadas pelo canal nas
              janelas indicadas. Útil para comparar carga relativa entre conexões.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">TMA mediana</dt>
            <dd>
              Tempo médio de resposta (mediana) calculado especificamente para
              este canal. Compara a saúde de cada canal isoladamente, não a da
              operação como um todo.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Mensagens perdidas</dt>
            <dd>
              Mensagens que a operação tentou enviar mas o provedor não conseguiu
              entregar. Causas comuns: número errado, aplicativo desinstalado,
              bloqueio do destinatário.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Conexão padrão (estrela)</dt>
            <dd>
              Conexão marcada como padrão recebe os atendimentos novos
              automaticamente quando o cliente não escolhe outro canal.
            </dd>
          </div>
        </dl>
      </details>
    </div>
  );
}
