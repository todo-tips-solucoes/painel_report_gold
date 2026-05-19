"use client";

import { cn } from "@/lib/utils";

type Cell = { weekday: number; hour: number; total: number };
type Props = { data: Cell[] };

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Rampa neutra (Ink Slate com alpha) sobe da quase-imperceptível à sombra densa.
// Telemetry Blue cheio só na faixa de pico — devolve The One Accent Rule.
function intensityClass(total: number, max: number): string {
  if (max === 0 || total === 0) return "bg-muted";
  const ratio = total / max;
  if (ratio > 0.85) return "bg-primary";
  if (ratio > 0.65) return "bg-foreground/55";
  if (ratio > 0.45) return "bg-foreground/40";
  if (ratio > 0.25) return "bg-foreground/25";
  if (ratio > 0.08) return "bg-foreground/15";
  return "bg-foreground/8";
}

// Labels semânticos para leitor de tela; o tooltip nativo (`title=`) já cobre hover/touch.
function cellAriaLabel(weekday: string, hour: number, total: number): string {
  const hh = String(hour).padStart(2, "0");
  if (total === 0) return `${weekday} ${hh}h, sem tickets`;
  if (total === 1) return `${weekday} ${hh}h, 1 ticket`;
  return `${weekday} ${hh}h, ${total} tickets`;
}

export function HeatmapChart({ data }: Props) {
  const max = data.reduce((a, c) => Math.max(a, c.total), 0);
  const byDayHour = new Map<string, number>();
  for (const c of data) byDayHour.set(`${c.weekday}|${c.hour}`, c.total);

  return (
    <div
      className="overflow-x-auto"
      role="img"
      aria-label={`Heatmap de tickets por dia da semana e hora. Pico de ${max} tickets em uma hora-dia.`}
    >
      <div className="inline-block min-w-full">
        {/* header de horas */}
        <div className="flex gap-[2px] pl-10 mb-1" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, h) => (
            <div
              key={h}
              className="w-5 text-[10px] text-muted-foreground text-center tabular-nums"
            >
              {h % 3 === 0 ? h : ""}
            </div>
          ))}
        </div>
        {/* linhas */}
        {WEEKDAYS.map((wd, w) => (
          <div key={w} className="flex items-center gap-[2px] mb-[2px]">
            <div
              className="w-10 text-[11px] text-muted-foreground pr-2 text-right"
              aria-hidden="true"
            >
              {wd}
            </div>
            {Array.from({ length: 24 }).map((_, h) => {
              const total = byDayHour.get(`${w}|${h}`) ?? 0;
              return (
                <div
                  key={h}
                  className={cn("w-5 h-5 rounded-sm", intensityClass(total, max))}
                  title={`${wd} ${String(h).padStart(2, "0")}h · ${total} tickets`}
                  role="img"
                  aria-label={cellAriaLabel(wd, h, total)}
                />
              );
            })}
          </div>
        ))}
        <div className="mt-3 pl-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Menos</span>
            <div className="flex gap-[2px]" aria-hidden="true">
              {[0.05, 0.2, 0.4, 0.55, 0.75, 0.95].map((r, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-4 h-4 rounded-sm",
                    intensityClass(Math.ceil(r * max), max),
                  )}
                />
              ))}
            </div>
            <span>Pico</span>
          </div>
          <span className="tabular-nums">
            Máximo por hora-dia: <span className="text-foreground font-medium">{max}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
