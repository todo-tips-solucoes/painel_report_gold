"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TIME_FMT = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

type Props = {
  updatedAt: number | null;
  isFetching: boolean;
  isStale: boolean;
  onRefresh: () => void;
  disabled?: boolean;
  className?: string;
};

export function FreshnessIndicator({
  updatedAt,
  isFetching,
  isStale,
  onRefresh,
  disabled,
  className,
}: Props) {
  const label = updatedAt
    ? `Atualizado às ${TIME_FMT.format(updatedAt)}`
    : "Aguardando primeira leitura";
  return (
    <div className={cn("flex items-center gap-1.5 text-xs", className)}>
      <span
        className={cn(
          "tabular-nums",
          isStale && !isFetching ? "text-warning" : "text-muted-foreground",
        )}
        aria-live="polite"
      >
        {isFetching ? "Atualizando…" : label}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground"
        onClick={onRefresh}
        disabled={disabled || isFetching}
        aria-label="Atualizar dados agora"
      >
        <RefreshCw
          className={cn(
            "h-3.5 w-3.5",
            isFetching && "animate-spin motion-reduce:animate-none",
          )}
          aria-hidden
        />
      </Button>
    </div>
  );
}

const STALE_THRESHOLD_MS_DEFAULT = 5 * 60_000;

// Hook complementar para gerenciar o estado "stale" de forma reativa
// sem precisar de refetch. O timestamp do tom warning aparece sozinho.
export function useFreshnessClock(staleThresholdMs = STALE_THRESHOLD_MS_DEFAULT) {
  const [now, setNow] = React.useState<number>(() => Date.now());
  React.useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  return (dataUpdatedAt: number) =>
    dataUpdatedAt > 0 && now - dataUpdatedAt > staleThresholdMs;
}

export const STALE_THRESHOLD_MS = STALE_THRESHOLD_MS_DEFAULT;
