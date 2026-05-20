import { companyQuerySchema } from "@/schemas/company";
import { fetchCompany } from "@/lib/company";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = companyQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    const company = await fetchCompany(parsed.data.companyId);
    if (!company) {
      return Response.json({ error: "Company not found" }, { status: 404 });
    }
    return Response.json(company);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 502 });
  }
}
