/**
 * Helpers de fuso horário para America/Sao_Paulo (UTC-3, sem horário de verão
 * desde 2019).
 *
 * O banco armazena timestamps em UTC mas o usuário pensa em horário de Brasília.
 * Todos os filtros de "dia" devem converter as bordas BRT → UTC.
 */

export const BRT_OFFSET_HOURS = 3;

const MS_PER_HOUR = 3600 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

/**
 * Retorna o início do dia BRT (00:00:00 BRT) como ISO UTC.
 * Exemplo: brtStartOfDay("2026-05-19") === "2026-05-19T03:00:00.000Z"
 */
export function brtStartOfDay(ymd: string): string {
  return `${ymd}T03:00:00.000Z`;
}

/**
 * Retorna o início do dia BRT seguinte (fim exclusivo do dia ymd) como ISO UTC.
 * Exemplo: brtEndOfDayExclusive("2026-05-19") === "2026-05-20T03:00:00.000Z"
 */
export function brtEndOfDayExclusive(ymd: string): string {
  const d = new Date(`${ymd}T03:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString();
}

/** Data atual em BRT no formato YYYY-MM-DD. */
export function brtToday(): string {
  const shifted = new Date(Date.now() - BRT_OFFSET_HOURS * MS_PER_HOUR);
  return shifted.toISOString().slice(0, 10);
}

/**
 * Início do dia BRT N dias atrás, como ISO UTC.
 * brtDaysAgoStart(0) = início do dia atual BRT (em UTC)
 * brtDaysAgoStart(7) = início do dia BRT de 7 dias atrás (em UTC)
 */
export function brtDaysAgoStart(daysAgo: number): string {
  const today = brtToday();
  const d = new Date(brtStartOfDay(today));
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString();
}

/**
 * Lista de YYYY-MM-DD para os últimos N dias em BRT (mais antigo primeiro,
 * incluindo hoje).
 */
export function brtLastNDays(n: number): string[] {
  const out: string[] = [];
  const today = brtToday();
  const base = new Date(brtStartOfDay(today));
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base.getTime() - i * MS_PER_DAY);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

/**
 * Converte um timestamp UTC para os componentes da hora local BRT.
 * Útil para heatmaps e gráficos diários em horário de Brasília.
 */
export function brtPartsFromUtc(isoUtc: string): {
  date: string; // YYYY-MM-DD em BRT
  weekday: number; // 0=Dom .. 6=Sáb (BRT)
  hour: number; // 0..23 (BRT)
} {
  const t = new Date(isoUtc).getTime() - BRT_OFFSET_HOURS * MS_PER_HOUR;
  const shifted = new Date(t);
  return {
    date: shifted.toISOString().slice(0, 10),
    weekday: shifted.getUTCDay(),
    hour: shifted.getUTCHours(),
  };
}
