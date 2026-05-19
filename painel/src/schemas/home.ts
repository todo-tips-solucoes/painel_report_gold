import { z } from "zod";

export const homeQuerySchema = z.object({
  companyId: z.coerce.number().int().positive(),
});

export type HomeQuery = z.infer<typeof homeQuerySchema>;

export type HomeResponse = {
  tickets: { today: number; last7d: number; last30d: number };
  tma: { medianSec: number | null; p90Sec: number | null; sampleSize: number };
  delivery: { rateAck3plus: number; rateAck4: number; sampleSize: number };
  conexoes: { active: number; total: number; activeNames: string[] };
  messagesLost30d: number;
  volumeDaily: Array<{ day: string; total: number }>;
  heatmap: Array<{ weekday: number; hour: number; total: number }>;
};
