import { z } from "zod";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const homeQuerySchema = z.object({
  companyId: z.coerce.number().int().positive(),
  from: z.string().regex(ISO_DATE).optional(),
  to: z.string().regex(ISO_DATE).optional(),
});

export type HomeQuery = z.infer<typeof homeQuerySchema>;

/**
 * `range` define a janela aplicada aos gráficos (volumeDaily e heatmap).
 * Demais KPIs (tickets.today/7d/30d, tma, delivery, conexoes, messagesLost30d)
 * permanecem em janelas fixas independentes do filtro — são leituras de
 * estado fixas que o usuário aprende a comparar entre si.
 */
export type HomeResponse = {
  range: { from: string; to: string };
  tickets: { today: number; last7d: number; last30d: number };
  tma: { medianSec: number | null; p90Sec: number | null; sampleSize: number };
  delivery: { rateAck3plus: number; rateAck4: number; sampleSize: number };
  conexoes: { active: number; total: number; activeNames: string[] };
  messagesLost30d: number;
  volumeDaily: Array<{ day: string; total: number }>;
  heatmap: Array<{ weekday: number; hour: number; total: number }>;
};
