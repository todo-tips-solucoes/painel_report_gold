/**
 * Presets de janela temporal para filtros, sempre em BRT (UTC-3).
 *
 * Por que BRT manual: o painel roda dentro de iframes hospedados em hosts
 * que podem estar em qualquer fuso. Calcular "hoje em BRT" independente do
 * fuso do browser garante que "este mês" seja sempre o mês corrente no
 * Brasil, e bate com os dados que o BFF computa.
 */

const MS_PER_DAY = 24 * 3600 * 1000;
const BRT_OFFSET_MS = 3 * 3600 * 1000;

export type DateRange = { from: string; to: string };

/** Data em BRT no formato YYYY-MM-DD. */
function brtIsoDate(timestamp = Date.now()): string {
  return new Date(timestamp - BRT_OFFSET_MS).toISOString().slice(0, 10);
}

function shiftDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function firstDayOfMonth(iso: string): string {
  return iso.slice(0, 8) + "01";
}

function lastDayOfPreviousMonth(iso: string): string {
  return shiftDays(firstDayOfMonth(iso), -1);
}

function firstDayOfPreviousMonth(iso: string): string {
  return firstDayOfMonth(lastDayOfPreviousMonth(iso));
}

// Semana brasileira: segunda a domingo
function firstDayOfWeek(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  const dayOfWeek = d.getUTCDay(); // 0 = domingo
  const daysBackToMonday = (dayOfWeek + 6) % 7;
  return shiftDays(iso, -daysBackToMonday);
}

export function rangeToday(now = Date.now()): DateRange {
  const today = brtIsoDate(now);
  return { from: today, to: today };
}

export function rangeYesterday(now = Date.now()): DateRange {
  const yesterday = shiftDays(brtIsoDate(now), -1);
  return { from: yesterday, to: yesterday };
}

export function rangeThisWeek(now = Date.now()): DateRange {
  const today = brtIsoDate(now);
  return { from: firstDayOfWeek(today), to: today };
}

export function rangeThisMonth(now = Date.now()): DateRange {
  const today = brtIsoDate(now);
  return { from: firstDayOfMonth(today), to: today };
}

export function rangeLastMonth(now = Date.now()): DateRange {
  const today = brtIsoDate(now);
  return {
    from: firstDayOfPreviousMonth(today),
    to: lastDayOfPreviousMonth(today),
  };
}

export function rangeLastNDays(n: number, now = Date.now()): DateRange {
  const today = brtIsoDate(now);
  return { from: shiftDays(today, -(n - 1)), to: today };
}

export type PresetId =
  | "today"
  | "yesterday"
  | "this-week"
  | "this-month"
  | "last-month"
  | "last-7d"
  | "last-30d"
  | "last-90d";

export type Preset = {
  id: PresetId;
  label: string;
  compute: (now?: number) => DateRange;
};

export const PRESETS: Preset[] = [
  { id: "today", label: "Hoje", compute: rangeToday },
  { id: "yesterday", label: "Ontem", compute: rangeYesterday },
  { id: "this-week", label: "Esta semana", compute: rangeThisWeek },
  { id: "this-month", label: "Este mês", compute: rangeThisMonth },
  { id: "last-month", label: "Mês passado", compute: rangeLastMonth },
  { id: "last-7d", label: "Últimos 7 dias", compute: (now) => rangeLastNDays(7, now) },
  { id: "last-30d", label: "Últimos 30 dias", compute: (now) => rangeLastNDays(30, now) },
  { id: "last-90d", label: "Últimos 90 dias", compute: (now) => rangeLastNDays(90, now) },
];

export const DEFAULT_PRESET_ID: PresetId = "this-month";

export function defaultRange(now = Date.now()): DateRange {
  return rangeThisMonth(now);
}

/** Retorna o preset que casa exatamente com a faixa atual, ou null se for custom. */
export function matchPreset(range: DateRange, now = Date.now()): PresetId | null {
  for (const p of PRESETS) {
    const candidate = p.compute(now);
    if (candidate.from === range.from && candidate.to === range.to) {
      return p.id;
    }
  }
  return null;
}
