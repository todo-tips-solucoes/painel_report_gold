"use client";

import * as React from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useIframeParams } from "@/components/iframe-context";
import { PorOrigemFilters, type PorOrigemFilters as Filters } from "@/components/por-origem/filters";
import { SummaryCards } from "@/components/por-origem/summary-cards";
import { PorOrigemTable } from "@/components/por-origem/data-table";
import {
  FreshnessIndicator,
  useFreshnessClock,
  STALE_THRESHOLD_MS,
} from "@/components/freshness-indicator";
import {
  ReportErrorState,
  parseFetchError,
} from "@/components/report-error-state";
import { useCompany, companyLabel } from "@/components/use-company";
import { defaultRange } from "@/lib/date-presets";
import type { PorOrigemResponse } from "@/schemas/por-origem";

function buildQs(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === "") continue;
    sp.set(k, String(v));
  }
  return sp.toString();
}

export default function PorOrigemPage() {
  const { companyId } = useIframeParams();
  const queryClient = useQueryClient();
  const [filters, setFilters] = React.useState<Filters>(() => {
    const { from, to } = defaultRange();
    return { from, to, bucket: "all" };
  });
  const { data: company } = useCompany(companyId);
  const label = companyLabel(company, companyId);
  const [page, setPage] = React.useState(1);
  const pageSize = 50;

  React.useEffect(() => {
    setPage(1);
  }, [filters.from, filters.to, filters.medicoTagId, filters.uf, filters.tipo, filters.bucket]);

  const qs = buildQs({
    companyId,
    from: filters.from,
    to: filters.to,
    medicoTagId: filters.medicoTagId,
    uf: filters.uf,
    tipo: filters.tipo,
    bucket: filters.bucket,
    page,
    pageSize,
  });

  const query = useQuery<PorOrigemResponse>({
    queryKey: ["por-origem", qs],
    queryFn: async () => {
      const r = await fetch(`/api/por-origem?${qs}`);
      if (!r.ok) {
        const t = await r.text();
        throw new Error(`Falha ${r.status}: ${t.slice(0, 200)}`);
      }
      return r.json();
    },
    placeholderData: keepPreviousData,
    staleTime: STALE_THRESHOLD_MS,
  });
  const { data, isLoading, isError, error, isFetching, dataUpdatedAt } = query;

  const checkStale = useFreshnessClock();
  const isStale = checkStale(dataUpdatedAt);

  const handleRefresh = React.useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["por-origem"] });
  }, [queryClient]);

  const exportTo = (format: "xlsx" | "csv") => {
    const exportQs = buildQs({
      companyId,
      from: filters.from,
      to: filters.to,
      medicoTagId: filters.medicoTagId,
      uf: filters.uf,
      tipo: filters.tipo,
      bucket: filters.bucket,
      format,
    });
    window.open(`/api/por-origem/export?${exportQs}`, "_blank");
  };

  // Mostra erro só quando não há dado nenhum em mãos.
  // Se há `data` antiga (keepPreviousData), preserva a tabela e sinaliza o erro
  // via freshness (stale) em vez de cobrir tudo.
  if (isError && !data) {
    return (
      <ReportErrorState
        parsed={parseFetchError(error)}
        onRetry={handleRefresh}
        isRetrying={isFetching}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Relatório por Origem
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {companyId
              ? `${label} · contatos do período, classificados por médico e tag CRM`
              : "Contatos do período, classificados por médico e tag CRM"}
          </p>
        </div>
        <FreshnessIndicator
          updatedAt={dataUpdatedAt || null}
          isFetching={isFetching}
          isStale={isStale || (isError && !!data)}
          onRefresh={handleRefresh}
        />
      </header>

      <PorOrigemFilters
        value={filters}
        onChange={setFilters}
        onExportXlsx={() => exportTo("xlsx")}
        onExportCsv={() => exportTo("csv")}
        isLoading={isLoading || isFetching}
      />

      {data?.summary && <SummaryCards summary={data.summary} />}

      <PorOrigemTable
        rows={data?.rows ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading || isFetching}
        onPageChange={setPage}
      />

      <Glossary />
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
          <dt className="font-medium text-foreground">Contato</dt>
          <dd>
            Pessoa cadastrada no CRM via mensagem recebida (WhatsApp ou outro canal).
            Cada número/perfil único conta como um contato.
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Tag de médico</dt>
          <dd>
            Tag no CRM que vincula o contato a um profissional específico. A lista
            de médicos vem de uma API externa e é atualizada via botão Médicos
            acima.
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Tag CRM</dt>
          <dd>
            Qualquer outra tag aplicada ao contato no CRM, geralmente identificando
            origem da campanha (Instagram, indicação, ads) ou estado da jornada.
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Sem classificação</dt>
          <dd>
            Contato sem tag de médico e sem tag CRM. É invisível para análises por
            origem, então virar essa marcação útil é uma ação direta para o time
            operacional.
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Filtrar por</dt>
          <dd>
            Recorte aplicado: todos, só com médico vinculado, só sem médico, ou só
            os que têm tag CRM. Mudar o recorte ajusta o resumo e a tabela.
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Exportar</dt>
          <dd>
            CSV (`;` como separador, BOM para Excel pt-BR) ou XLSX. Mantém os
            filtros atuais e ignora paginação: exporta o recorte inteiro.
          </dd>
        </div>
      </dl>
    </details>
  );
}
