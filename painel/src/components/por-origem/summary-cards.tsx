import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/kpi-card";
import { cn } from "@/lib/utils";
import { fmtNumber, fmtPercent } from "@/lib/format";

type Summary = {
  totalContatos: number;
  comMedico: number;
  comCRM: number;
  semClassificacao: number;
  topMedicos: { nome: string; total: number }[];
  topCRM: { nome: string; total: number }[];
};

// O hero é dinâmico: se ratio "sem classificação" > 30%, vira hero em warning
// (anomalia acionável). Senão, hero é "Contatos no período" como pulso do recorte.
type HeroPick =
  | { kind: "unclassified"; ratio: number; value: number }
  | { kind: "total"; value: number };

function pickHero(s: Summary): HeroPick {
  if (s.totalContatos === 0) return { kind: "total", value: 0 };
  const ratio = s.semClassificacao / s.totalContatos;
  if (ratio > 0.3) {
    return { kind: "unclassified", ratio, value: s.semClassificacao };
  }
  return { kind: "total", value: s.totalContatos };
}

function TopList({
  title,
  help,
  items,
  emptyLabel,
}: {
  title: string;
  help?: string;
  items: { nome: string; total: number }[];
  emptyLabel: string;
}) {
  const max = items.reduce((a, c) => Math.max(a, c.total), 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{title}</span>
        </CardTitle>
        {help && <p className="mt-1 text-xs text-muted-foreground">{help}</p>}
      </CardHeader>
      <CardContent className="pt-0">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <ol className="space-y-2">
            {items.map((item, i) => {
              const ratio = max > 0 ? item.total / max : 0;
              return (
                <li
                  key={item.nome}
                  className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-3 text-sm"
                >
                  <span className="text-muted-foreground tabular-nums text-right">
                    {i + 1}.
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate" title={item.nome}>
                        {item.nome}
                      </span>
                    </div>
                    <div
                      className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                      aria-hidden="true"
                    >
                      <div
                        className={cn(
                          "h-full rounded-full",
                          i === 0 ? "bg-primary" : "bg-foreground/30",
                        )}
                        style={{ width: `${Math.max(2, ratio * 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="tabular-nums font-medium">{fmtNumber(item.total)}</span>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

export function SummaryCards({ summary }: { summary: Summary }) {
  const hero = pickHero(summary);

  return (
    <div className="grid gap-4">
      {/* Linha 1 — hero + 3 KPIs de apoio em 12-col */}
      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-6">
          {hero.kind === "unclassified" ? (
            <KpiCard
              variant="hero"
              label="Sem classificação (atenção)"
              value={hero.value}
              tone="warning"
              caption={`${fmtPercent(hero.ratio, 1)} do recorte sem médico vinculado e sem tag CRM. Distribuir esses contatos é a próxima ação.`}
              hint={`Total no período: ${fmtNumber(summary.totalContatos)} contatos.`}
              help="Contatos que não foram vinculados a nenhum médico (via tag de médico no CRM) e também não têm nenhuma tag CRM aplicada. São contatos cadastrados, mas ainda invisíveis para qualquer análise de origem."
            />
          ) : (
            <KpiCard
              variant="hero"
              label="Contatos no período"
              value={hero.value}
              tone="primary"
              caption={
                summary.totalContatos === 0
                  ? "Nenhum contato no recorte. Ajuste as datas ou o filtro."
                  : `Distribuição classificada por médico e tag CRM no resumo abaixo.`
              }
              hint={`${fmtNumber(summary.comMedico)} com médico · ${fmtNumber(summary.comCRM)} com tag CRM`}
              help="Total de contatos cadastrados no CRM dentro do período e dos filtros aplicados. Um contato pode estar em mais de uma categoria (com médico E com tag CRM)."
            />
          )}
        </div>
        <div className="md:col-span-2">
          <KpiCard
            label="Com médico vinculado"
            value={summary.comMedico}
            percentOf={summary.totalContatos}
            tone="success"
            help="Contatos que têm pelo menos uma tag de médico cadastrada. Permite atribuir conversões ao profissional certo."
          />
        </div>
        <div className="md:col-span-2">
          <KpiCard
            label="Com tag CRM"
            value={summary.comCRM}
            percentOf={summary.totalContatos}
            help="Contatos que têm alguma tag aplicada no CRM (origem da campanha, status, qualificação). Independe de ter ou não médico vinculado."
          />
        </div>
        <div className="md:col-span-2">
          {hero.kind === "unclassified" ? (
            <KpiCard
              label="Total no período"
              value={summary.totalContatos}
              tone="primary"
              help="Total absoluto de contatos no recorte, independentemente de classificação."
            />
          ) : (
            <KpiCard
              label="Sem classificação"
              value={summary.semClassificacao}
              percentOf={summary.totalContatos}
              tone={summary.semClassificacao > 0 ? "warning" : "success"}
              help="Contatos sem médico vinculado e sem tag CRM. Não aparecem em nenhuma análise de origem até serem classificados."
            />
          )}
        </div>
      </div>

      {/* Linha 2 — Top 10 lado a lado com barra inline */}
      <div className="grid gap-4 md:grid-cols-2">
        <TopList
          title="Top 10 médicos com mais contatos"
          help="Médicos com mais contatos no recorte. A barra mostra a proporção em relação ao primeiro."
          items={summary.topMedicos}
          emptyLabel="Nenhum médico classificado no recorte."
        />
        <TopList
          title="Top 10 tags CRM com mais contatos"
          help="Tags do CRM com mais contatos no recorte."
          items={summary.topCRM}
          emptyLabel="Nenhuma tag CRM no recorte."
        />
      </div>
    </div>
  );
}
