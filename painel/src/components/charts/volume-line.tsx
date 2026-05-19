"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

type Props = {
  data: Array<{ day: string; total: number }>;
};

// Tokens vêm de globals.css (--ds-*); mantém o gráfico em sincronia
// com a paleta Tailwind sem duplicar literais HSL no JSX.
const C = {
  border: "var(--ds-border)",
  muted: "var(--ds-muted-foreground)",
  primary: "var(--ds-primary)",
  background: "var(--ds-background)",
  foreground: "var(--ds-foreground)",
};

export function VolumeLineChart({ data }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    label: format(parseISO(d.day), "dd/MM", { locale: ptBR }),
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={formatted} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: C.muted }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: C.muted }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip
          contentStyle={{
            background: C.background,
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            fontSize: 12,
            color: C.foreground,
            boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
          }}
          cursor={{ stroke: C.border, strokeDasharray: "3 3" }}
          formatter={(value: number) => [value, "Tickets"]}
          labelFormatter={(label) => `Dia ${label}`}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke={C.primary}
          strokeWidth={2}
          dot={{ r: 3, fill: C.primary, stroke: C.primary }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
