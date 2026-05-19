import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { cn } from "@/lib/utils";
import { fmtNumber, fmtPercent } from "@/lib/format";

type Tone = "default" | "primary" | "success" | "warning" | "destructive";
type Variant = "default" | "hero";

type Props = {
  label: string;
  value: number | string;
  hint?: string;
  percentOf?: number;
  tone?: Tone;
  variant?: Variant;
  delta?: {
    valueLabel: string;
    direction: "up" | "down" | "flat";
    goodWhen?: "up" | "down";
  };
  caption?: string;
  help?: React.ReactNode;
  children?: React.ReactNode;
};

const toneClasses: Record<Tone, string> = {
  default: "text-foreground",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

function deltaToneClass(d: NonNullable<Props["delta"]>): string {
  if (d.direction === "flat") return "text-muted-foreground";
  const good = d.goodWhen ?? "up";
  const isGood = d.direction === good;
  return isGood ? "text-success" : "text-destructive";
}

function deltaGlyph(direction: "up" | "down" | "flat"): string {
  if (direction === "up") return "↑";
  if (direction === "down") return "↓";
  return "→";
}

export function KpiCard({
  label,
  value,
  hint,
  percentOf,
  tone = "default",
  variant = "default",
  delta,
  caption,
  help,
  children,
}: Props) {
  const displayValue = typeof value === "number" ? fmtNumber(value) : value;
  const ratio =
    typeof value === "number" && percentOf && percentOf > 0 ? value / percentOf : null;

  const isHero = variant === "hero";

  return (
    <Card className={cn(isHero && "h-full")}>
      <CardContent className={cn(isHero && "px-6 py-5")}>
        <div
          className={cn(
            "flex items-center gap-1.5 uppercase tracking-wide text-muted-foreground",
            isHero ? "text-[13px] font-medium" : "text-xs",
          )}
        >
          <span>{label}</span>
          {help && <InfoTooltip label={label}>{help}</InfoTooltip>}
        </div>
        <div className="mt-2 flex items-baseline gap-3">
          <div
            className={cn(
              "font-semibold tabular-nums leading-none",
              isHero
                ? "text-[clamp(2.5rem,4.5vw,3.5rem)] tracking-tight"
                : "text-3xl",
              toneClasses[tone],
            )}
          >
            {displayValue}
          </div>
          {delta && (
            <span
              className={cn(
                "tabular-nums font-medium",
                isHero ? "text-base" : "text-sm",
                deltaToneClass(delta),
              )}
              aria-label={`Variação ${delta.direction}: ${delta.valueLabel}`}
            >
              {deltaGlyph(delta.direction)} {delta.valueLabel}
            </span>
          )}
        </div>
        {caption && isHero && (
          <div className="mt-2 text-sm text-muted-foreground">{caption}</div>
        )}
        {(hint || ratio != null) && (
          <div
            className={cn(
              "mt-1 text-muted-foreground",
              isHero ? "text-sm" : "text-xs",
            )}
          >
            {ratio != null && <span className="mr-2">{fmtPercent(ratio)}</span>}
            {hint && <span>{hint}</span>}
          </div>
        )}
        {children && <div className={cn("mt-3", isHero && "mt-4")}>{children}</div>}
      </CardContent>
    </Card>
  );
}
