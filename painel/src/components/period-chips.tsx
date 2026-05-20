"use client";

import * as React from "react";
import { PRESETS, matchPreset, type PresetId } from "@/lib/date-presets";
import { cn } from "@/lib/utils";

type Props = {
  value: { from: string; to: string };
  onChange: (range: { from: string; to: string }) => void;
  label?: string;
  hint?: string;
  className?: string;
};

export function PeriodChips({
  value,
  onChange,
  label = "Período",
  hint,
  className,
}: Props) {
  const active: PresetId | null = matchPreset(value);

  const handleClick = (id: PresetId) => {
    const preset = PRESETS.find((p) => p.id === id);
    if (!preset) return;
    onChange(preset.compute());
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <span className="text-xs text-muted-foreground mr-1">{label}:</span>
      {PRESETS.map((p) => {
        const isActive = active === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => handleClick(p.id)}
            aria-pressed={isActive}
            className={cn(
              "inline-flex h-7 items-center rounded-full border px-3 text-xs font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground/80 hover:bg-muted hover:text-foreground",
            )}
          >
            {p.label}
          </button>
        );
      })}
      {active === null && (
        <span className="text-xs text-muted-foreground italic ml-1">
          personalizado
        </span>
      )}
      {hint && (
        <span className="text-xs text-muted-foreground ml-2">{hint}</span>
      )}
    </div>
  );
}
