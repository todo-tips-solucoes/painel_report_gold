"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  children: React.ReactNode;
  className?: string;
};

// Tooltip auxiliar para termos técnicos. CSS-only (hover/focus-within), sem deps.
// Não é canal único de informação crítica — só expande contexto.
// Acessível: o botão tem aria-label legível, e o conteúdo é descoberto por
// teclado (Tab) via :focus-within.
export function InfoTooltip({ label, children, className }: Props) {
  return (
    <span className={cn("group relative inline-flex align-middle", className)}>
      <button
        type="button"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`Explicação: ${label}`}
      >
        <Info className="h-3 w-3" aria-hidden />
      </button>
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 top-full z-50 mt-1.5 w-64 max-w-[min(18rem,calc(100vw-2rem))]",
          "-translate-x-1/2 rounded-md border border-border bg-background px-3 py-2",
          "text-left text-xs font-normal normal-case tracking-normal leading-snug text-foreground",
          "opacity-0 shadow-sm transition-opacity duration-150 motion-reduce:transition-none",
          "group-hover:opacity-100 group-focus-within:opacity-100",
        )}
      >
        {children}
      </span>
    </span>
  );
}
