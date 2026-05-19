import { getMedicoIndex } from "@/lib/medicos";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { list, fetchedAt } = await getMedicoIndex();
    return Response.json({
      total: list.length,
      fetchedAt: new Date(fetchedAt).toISOString(),
      medicos: list.map((m) => ({
        tagId: m.tagId,
        nome: m.nome,
        uf: m.uf ?? null,
        tipo: m.tipo ?? null,
        ativo: m.ativo ?? null,
        chatAtivo: m.chatAtivo ?? null,
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 502 });
  }
}
