"use client";

import { cn } from "@/lib/utils";
import { fmtNumber, fmtPercent } from "@/lib/format";

type Bar = {
  label: string;
  value: number;
  hint?: string;
  highlight?: boolean;
};

type Props = {
  data: Bar[];
  showPct?: boolean;
};

export function HorizontalBars({ data, showPct = true }: Props) {
  const max = data.reduce((a, b) => Math.max(a, b.value), 0);
  const total = data.reduce((a, b) => a + b.value, 0);
  return (
    <div className="space-y-2">
      {data.length === 0 && (
        <div className="text-sm text-muted-foreground">Sem dados.</div>
      )}
      {data.map((b, i) => {
        const ratio = max > 0 ? b.value / max : 0;
        const pct = total > 0 ? b.value / total : 0;
        return (
          <div key={`${b.label}-${i}`}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className={cn("truncate", b.highlight && "font-semibold")} title={b.label}>
                {b.label}
              </span>
              <span className="tabular-nums text-muted-foreground">
                {fmtNumber(b.value)}
                {showPct && total > 0 && (
                  <span className="ml-2 text-xs">({fmtPercent(pct)})</span>
                )}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  b.highlight ? "bg-warning" : "bg-primary",
                )}
                style={{ width: `${Math.max(2, ratio * 100)}%` }}
              />
            </div>
            {b.hint && (
              <div className="text-xs text-muted-foreground mt-0.5">{b.hint}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
