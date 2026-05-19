import { format as fnsFormat } from "date-fns";
import { ptBR } from "date-fns/locale";

export function fmtDateTime(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return fnsFormat(d, "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
}

export function fmtDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return fnsFormat(d, "dd/MM/yyyy", { locale: ptBR });
}

export function fmtNumber(n: number | null | undefined): string {
  if (n == null) return "0";
  return new Intl.NumberFormat("pt-BR").format(n);
}

export function fmtPercent(n: number | null | undefined, digits = 1): string {
  if (n == null) return "0%";
  return `${(n * 100).toFixed(digits).replace(".", ",")}%`;
}

export function fmtCurrencyBRL(n: number | null | undefined): string {
  if (n == null || !isFinite(n)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(n);
}

export function fmtDuration(seconds: number | null | undefined): string {
  if (seconds == null || !isFinite(seconds)) return "—";
  if (seconds < 60) return `${seconds.toFixed(1)} s`;
  const m = seconds / 60;
  if (m < 60) return `${m.toFixed(1)} min`;
  const h = m / 60;
  if (h < 24) return `${h.toFixed(1)} h`;
  return `${(h / 24).toFixed(1)} d`;
}

export function fmtPhone(num: string | null | undefined): string {
  if (!num) return "";
  const digits = num.replace(/\D/g, "");
  if (digits.length === 13) {
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 12) {
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8)}`;
  }
  return num;
}
