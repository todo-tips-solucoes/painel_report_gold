import { porOrigemQuerySchema, type PorOrigemResponse } from "@/schemas/por-origem";
import { fetchPorOrigemAll, summarize } from "@/lib/por-origem";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = porOrigemQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const q = parsed.data;

  try {
    const { rows, totalContatos } = await fetchPorOrigemAll(q);
    const summary = summarize(rows, totalContatos);
    const start = (q.page - 1) * q.pageSize;
    const pageRows = rows.slice(start, start + q.pageSize);
    const body: PorOrigemResponse = {
      rows: pageRows,
      total: rows.length,
      page: q.page,
      pageSize: q.pageSize,
      summary,
    };
    return Response.json(body);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 502 });
  }
}
