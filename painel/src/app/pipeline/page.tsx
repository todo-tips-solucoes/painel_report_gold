"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KpiCard } from "@/components/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, Th, Tr, Td } from "@/components/ui/table";
import { Pagination } from "@/components/pagination";
import { Select } from "@/components/ui/select";
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
import { rangeLastNDays } from "@/lib/date-presets";
import { fmtCurrencyBRL, fmtDateTime, fmtNumber } from "@/lib/format";
import type { PipelineResponse } from "@/schemas/pipeline";

const PAGE_SIZES = [10, 25, 50, 100];

type HeroPick =
  | { kind: "underused"; total: number; lanes: number }
  | { kind: "inconsistent"; etapasOrfans: number; lanesOciosas: number }
  | { kind: "volume"; total: number; valor: number };

function pickHero(data: PipelineResponse): HeroPick {
  if (data.total < 5) {
    return {
      kind: "underused",
      total: data.total,
      lanes: data.lanesCadastradas.length,
    };
  }
  const etapasOrfans = data.diagnostico.etapasUsadasNaoCadastradas.length;
  const lanesOciosas = data.diagnostico.lanesCadastradasNaoUsadas.length;
  if (etapasOrfans > 0 || lanesOciosas > 0) {
    return { kind: "inconsistent", etapasOrfans, lanesOciosas };
  }
  return { kind: "volume", total: data.total, valor: data.valorTotal };
}

export default function PipelinePage() {
  const { companyId } = useIframeParams();
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);
  // Default 90d: oportunidades costumam ter ciclo mais longo que tickets.
  const [range, setRange] = React.useState(() => rangeLastNDays(90));
  const { data: company } = useCompany(companyId);
  const label = companyLabel(company, companyId);

  const qs = `companyId=${companyId}&from=${range.from}&to=${range.to}`;
  const query = useQuery<PipelineResponse>({
    queryKey: ["pipeline", companyId, range.from, range.to],
    queryFn: async () => {
      const r = await fetch(`/api/kpis/pipeline?${qs}`);
      if (!r.ok) throw new Error(`Falha ${r.status}: ${await r.text()}`);
      return r.json();
    },
    staleTime: STALE_THRESHOLD_MS,
  });
  const { data, isLoading, isError, error, isFetching, dataUpdatedAt } = query;

  const checkStale = useFreshnessClock();
  const isStale = checkStale(dataUpdatedAt);

  const handleRefresh = React.useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["pipeline", companyId] });
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

  const total = data.oportunidades.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const visibleOpps = data.oportunidades.slice(startIdx, startIdx + pageSize);
  const startRow = total === 0 ? 0 : startIdx + 1;
  const endRow = Math.min(safePage * pageSize, total);

  const stageBars = data.porEtapa.map((s) => ({
    label: s.name,
    value: s.count,
    hint: s.valorTotal > 0 ? `Valor: ${fmtCurrencyBRL(s.valorTotal)}` : undefined,
  }));
  const fonteBars = data.byFonte.map((f) => ({ label: f.name, value: f.count }));
  const hero = pickHero(data);
  const isUnderused = hero.kind === "underused";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Pipeline comercial
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {companyId
              ? `Empresa ${label} · oportunidades e estágios do funil`
              : "Oportunidades e estágios do funil"}
          </p>
        </div>
        <FreshnessIndicator
          updatedAt={dataUpdatedAt || null}
          isFetching={isFetching}
          isStale={isStale || (isError && !!data)}
          onRefresh={handleRefresh}
        />
      </header>

      <PeriodChips
        value={range}
        onChange={setRange}
        hint="filtra oportunidades por data de criação"
      />

      {/* Banner de subutilização — alerta acionável inspirado nos "Alertas Ativos" */}
      {isUnderused && (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertTriangle
              className="h-5 w-5 text-warning mt-0.5 shrink-0"
              aria-hidden
            />
            <div className="text-sm space-y-1">
              <div>
                <strong>Pipeline subutilizado.</strong> Apenas{" "}
                <span className="font-semibold tabular-nums">{data.total}</span>{" "}
                {data.total === 1
                  ? "oportunidade cadastrada"
                  : "oportunidades cadastradas"}
                {", "}com {data.lanesCadastradas.length} estágios configurados.
              </div>
              <div className="text-xs text-muted-foreground">
                Considere treinar a equipe para registrar oportunidades, ou criar
                automação que popule o pipeline a partir de tags ou filas
                específicas.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hero condicional + KPIs de apoio */}
      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-6">
          {hero.kind === "underused" ? (
            <KpiCard
              variant="hero"
              label="Oportunidades cadastradas"
              value={hero.total}
              tone="warning"
              caption={`Pipeline subutilizado. ${hero.lanes} estágios configurados, mas só ${hero.total} ${hero.total === 1 ? "oportunidade registrada" : "oportunidades registradas"}.`}
              hint="Indicador mais útil aqui é o engajamento da equipe com o módulo de oportunidades."
              help="Total de oportunidades cadastradas na operação. Quando muito baixo, sugere que o módulo de pipeline está sendo ignorado pela equipe."
            />
          ) : hero.kind === "inconsistent" ? (
            <KpiCard
              variant="hero"
              label="Inconsistências de configuração"
              value={hero.etapasOrfans + hero.lanesOciosas}
              tone="warning"
              caption={`${hero.etapasOrfans} ${hero.etapasOrfans === 1 ? "etapa usada não cadastrada" : "etapas usadas não cadastradas"} e ${hero.lanesOciosas} ${hero.lanesOciosas === 1 ? "lane configurada sem uso" : "lanes configuradas sem uso"}.`}
              hint="Detalhes no diagnóstico abaixo. Alinhar etapas evita relatórios fragmentados."
              help="Diferença entre 'etapadofunil' (texto livre escrito pela equipe) e PipelineLanes (lanes configuradas). Quando divergem, os relatórios mostram subgrupos que não somam o todo."
            />
          ) : (
            <KpiCard
              variant="hero"
              label="Pipeline ativo"
              value={hero.total}
              tone="primary"
              caption={`${fmtNumber(hero.total)} oportunidades distribuídas em ${data.porEtapa.length} estágios, totalizando ${fmtCurrencyBRL(hero.valor)}.`}
              hint={`${data.byFonte.filter((f) => f.name !== "(sem fonte)").length} fontes distintas de origem.`}
              help="Total de oportunidades cadastradas com pelo menos uma etapa do funil preenchida."
            />
          )}
        </div>
        <div className="md:col-span-3">
          <KpiCard
            label="Valor total"
            value={fmtCurrencyBRL(data.valorTotal)}
            tone="success"
            hint={
              data.diagnostico.valoresSemParse > 0
                ? `${data.diagnostico.valoresSemParse} valor(es) inválido(s) ignorados`
                : "Soma de todas as oportunidades"
            }
            help="Soma dos valores numéricos parseados a partir do campo livre 'valor' das oportunidades. Valores não-numéricos são ignorados."
          />
        </div>
        <div className="md:col-span-3">
          <KpiCard
            label="Estágios em uso"
            value={data.porEtapa.length}
            hint={`${data.lanesCadastradas.length} cadastrados`}
            help="Quantas etapas diferentes aparecem nas oportunidades. Se diverge do número de lanes cadastradas, há etapa livre fora do padrão."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KpiCard
          label="Fontes distintas"
          value={data.byFonte.filter((f) => f.name !== "(sem fonte)").length}
          hint={`${data.byFonte.find((f) => f.name === "(sem fonte)")?.count ?? 0} sem fonte`}
          help="Origem da oportunidade (ex: Instagram, indicação, ads). Oportunidades sem fonte não entram em análises de atribuição de receita."
        />
        <KpiCard
          label="Total de oportunidades"
          value={data.total}
          tone={data.total === 0 ? "warning" : "default"}
          help="Soma absoluta de oportunidades no banco, independente de estágio ou fonte."
        />
      </div>

      {/* Diagnóstico de inconsistências */}
      {(data.diagnostico.etapasUsadasNaoCadastradas.length > 0 ||
        data.diagnostico.lanesCadastradasNaoUsadas.length > 0) && (
        <Card className="border-warning/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-4 w-4 text-warning" aria-hidden />
              Inconsistências entre etapas e lanes
              <InfoTooltip label="Inconsistências entre etapas e lanes">
                O campo 'etapadofunil' é texto livre e não tem vínculo com as
                lanes cadastradas em PipelineLanes. Divergências mostradas aqui
                podem fragmentar relatórios em subgrupos que não somam o todo.
              </InfoTooltip>
            </CardTitle>
            <CardDescription>
              Etapas usadas pela equipe que não estão cadastradas, ou lanes
              cadastradas que nunca aparecem em oportunidades.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Etapas usadas mas não cadastradas
              </div>
              {data.diagnostico.etapasUsadasNaoCadastradas.length === 0 ? (
                <span className="text-muted-foreground">nenhuma</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {data.diagnostico.etapasUsadasNaoCadastradas.map((s) => (
                    <Badge key={s} variant="warning">
                      {s}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Lanes cadastradas nunca usadas
              </div>
              {data.diagnostico.lanesCadastradasNaoUsadas.length === 0 ? (
                <span className="text-muted-foreground">nenhuma</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {data.diagnostico.lanesCadastradasNaoUsadas.map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Funil por etapa</CardTitle>
            <CardDescription>
              Oportunidades distribuídas pelas etapas registradas no campo
              etapadofunil.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HorizontalBars data={stageBars} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Origem das oportunidades</CardTitle>
            <CardDescription>
              Distribuição por canal de origem informado em cada oportunidade.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HorizontalBars data={fonteBars} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Oportunidades cadastradas</CardTitle>
          <CardDescription>
            {total === 0
              ? "Nenhuma oportunidade encontrada."
              : `Mostrando ${fmtNumber(startRow)} a ${fmtNumber(endRow)} de ${fmtNumber(total)}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <THead>
              <Tr>
                <Th>ID</Th>
                <Th>Nome</Th>
                <Th>Etapa</Th>
                <Th>Produto</Th>
                <Th>Fonte</Th>
                <Th className="text-right">Valor</Th>
                <Th>Criada em</Th>
              </Tr>
            </THead>
            <TBody>
              {total === 0 ? (
                <Tr>
                  <Td
                    colSpan={7}
                    className="text-center py-10 text-muted-foreground"
                  >
                    Nenhuma oportunidade cadastrada nesta operação.
                  </Td>
                </Tr>
              ) : (
                visibleOpps.map((o) => (
                  <Tr key={o.id}>
                    <Td className="tabular-nums">{o.id}</Td>
                    <Td className="font-medium">{o.name || "sem nome"}</Td>
                    <Td>
                      {o.etapadofunil ? (
                        <Badge
                          variant="subtle"
                          className="max-w-[18ch] truncate"
                          title={o.etapadofunil}
                        >
                          {o.etapadofunil}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          sem etapa
                        </span>
                      )}
                    </Td>
                    <Td className="text-sm">{o.produto || "—"}</Td>
                    <Td className="text-sm text-muted-foreground">
                      {o.fonte || "—"}
                    </Td>
                    <Td className="text-right tabular-nums font-medium">
                      {fmtCurrencyBRL(o.valorParsed)}
                    </Td>
                    <Td className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                      {fmtDateTime(o.createdAt)}
                    </Td>
                  </Tr>
                ))
              )}
            </TBody>
          </Table>

          {total > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>
                  {fmtNumber(startRow)} a {fmtNumber(endRow)} de{" "}
                  {fmtNumber(total)} oportunidades
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
          )}
        </CardContent>
      </Card>

      <details className="rounded-lg border border-border bg-muted/30 px-5 py-3 text-sm text-muted-foreground">
        <summary className="cursor-pointer select-none font-medium text-foreground">
          O que estes termos significam?
        </summary>
        <dl className="mt-3 grid gap-x-8 gap-y-3 md:grid-cols-2">
          <div>
            <dt className="font-medium text-foreground">Oportunidade</dt>
            <dd>
              Cadastro de uma negociação em andamento, vinculado a um contato e a
              um ticket. Permite acompanhar o funil comercial além do simples
              fluxo de mensagens.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Etapa do funil</dt>
            <dd>
              Estágio em que a oportunidade está. Campo de texto livre preenchido
              pela equipe (ex: contato inicial, proposta, fechamento).
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Lane cadastrada</dt>
            <dd>
              Estágio configurado oficialmente em PipelineLanes. Idealmente
              casaria com os valores em etapadofunil, mas como o campo é livre,
              divergências aparecem na seção de inconsistências.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Valor total</dt>
            <dd>
              Soma dos valores numéricos parseados a partir do campo livre 'valor'
              das oportunidades. Entradas não-numéricas são contadas no
              indicador 'valores inválidos' mas não somam.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Fonte</dt>
            <dd>
              Canal de origem da oportunidade (Instagram, indicação, ads). Quando
              ausente, a oportunidade fica fora de análises de atribuição de
              receita por canal.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Pipeline subutilizado</dt>
            <dd>
              Sinalização automática: quando há menos de 5 oportunidades
              cadastradas, a equipe provavelmente não está usando o módulo, e os
              indicadores devem ser interpretados com ressalva.
            </dd>
          </div>
        </dl>
      </details>
    </div>
  );
}
