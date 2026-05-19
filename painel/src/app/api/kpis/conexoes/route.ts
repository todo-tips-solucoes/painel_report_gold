import { conexoesQuerySchema } from "@/schemas/conexoes";
import { fetchConexoes } from "@/lib/conexoes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = conexoesQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    const body = await fetchConexoes(parsed.data);
    return Response.json(body);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 502 });
  }
}
