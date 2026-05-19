"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ParsedFetchError = {
  status: number | null;
  category: "client" | "server" | "network" | "unknown";
  title: string;
  body: string;
  raw: string;
};

const FALHA_PATTERNS: RegExp[] = [
  /^Falha (\d+):\s?([\s\S]*)$/,
  /^Falha ao carregar \((\d+)\):\s?([\s\S]*)$/,
];

export function parseFetchError(err: unknown): ParsedFetchError {
  const raw = err instanceof Error ? err.message : String(err);
  for (const re of FALHA_PATTERNS) {
    const match = re.exec(raw);
    if (!match) continue;
    const status = Number(match[1]);
    const body = (match[2] ?? "").trim();
    if (status >= 400 && status < 500) {
      return {
        status,
        category: "client",
        title:
          status === 404 ? "Operação não encontrada" : "Parâmetros inválidos",
        body:
          status === 404
            ? "Não localizamos esta operação. Confira o identificador no link do iframe."
            : "A consulta foi recusada. Confira os parâmetros enviados pelo CRM.",
        raw,
      };
    }
    return {
      status,
      category: "server",
      title: "Serviço temporariamente indisponível",
      body:
        "O backend de relatórios não respondeu agora. Geralmente é transitório. Tentar novamente costuma resolver.",
      raw: body || raw,
    };
  }
  if (/network|fetch|failed to fetch/i.test(raw)) {
    return {
      status: null,
      category: "network",
      title: "Sem conexão com o backend",
      body: "Verifique a rede e tente novamente.",
      raw,
    };
  }
  return {
    status: null,
    category: "unknown",
    title: "Não foi possível carregar agora",
    body: "Algo deu errado ao buscar os dados. Tentar novamente costuma resolver.",
    raw,
  };
}

type Props = {
  parsed: ParsedFetchError;
  onRetry: () => void;
  isRetrying: boolean;
};

export function ReportErrorState({ parsed, onRetry, isRetrying }: Props) {
  const accent =
    parsed.category === "client" ? "text-warning" : "text-destructive";
  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-4 py-8">
        <div className="flex items-start gap-3">
          <AlertCircle
            className={cn("mt-0.5 h-5 w-5 shrink-0", accent)}
            aria-hidden
          />
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {parsed.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{parsed.body}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onRetry}
            disabled={isRetrying}
          >
            <RefreshCw
              className={cn(
                "h-4 w-4",
                isRetrying && "animate-spin motion-reduce:animate-none",
              )}
              aria-hidden
            />
            {isRetrying ? "Tentando…" : "Tentar de novo"}
          </Button>
          {parsed.status != null && (
            <span className="text-xs text-muted-foreground tabular-nums">
              HTTP {parsed.status}
            </span>
          )}
        </div>
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer select-none">
            Detalhes técnicos
          </summary>
          <pre className="mt-2 max-w-full overflow-auto whitespace-pre-wrap break-words rounded bg-muted/50 p-2 text-[11px] leading-snug">
            {parsed.raw}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
}
