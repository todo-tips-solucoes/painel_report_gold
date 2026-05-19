"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmtNumber } from "@/lib/format";

type Props = {
  page: number;
  totalPages: number;
  isLoading?: boolean;
  onPageChange: (p: number) => void;
};

export function Pagination({ page, totalPages, isLoading, onPageChange }: Props) {
  const [draft, setDraft] = React.useState(String(page));

  React.useEffect(() => {
    setDraft(String(page));
  }, [page]);

  const commit = () => {
    const n = Number(draft);
    if (!Number.isFinite(n) || n < 1) {
      setDraft(String(page));
      return;
    }
    const clamped = Math.min(Math.max(1, Math.floor(n)), totalPages);
    if (clamped !== page) onPageChange(clamped);
    else setDraft(String(page));
  };

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(1)}
        disabled={page <= 1 || !!isLoading}
        title="Primeira página"
        aria-label="Primeira página"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1 || !!isLoading}
        title="Página anterior"
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
        <span>Página</span>
        <Input
          type="number"
          min={1}
          max={totalPages}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            } else if (e.key === "Escape") {
              setDraft(String(page));
              (e.target as HTMLInputElement).blur();
            }
          }}
          disabled={!!isLoading || totalPages <= 1}
          className="h-8 w-16 text-center tabular-nums"
        />
        <span className="tabular-nums">de {fmtNumber(totalPages)}</span>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages || !!isLoading}
        title="Próxima página"
        aria-label="Próxima página"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(totalPages)}
        disabled={page >= totalPages || !!isLoading}
        title="Última página"
        aria-label="Última página"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
