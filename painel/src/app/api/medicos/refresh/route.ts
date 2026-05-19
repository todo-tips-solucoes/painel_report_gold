import { getMedicoIndex, invalidateMedicos } from "@/lib/medicos";

export const dynamic = "force-dynamic";

export async function POST() {
  invalidateMedicos();
  try {
    const { list, fetchedAt } = await getMedicoIndex(true);
    return Response.json({
      refreshed: true,
      total: list.length,
      fetchedAt: new Date(fetchedAt).toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ refreshed: false, error: msg }, { status: 502 });
  }
}
