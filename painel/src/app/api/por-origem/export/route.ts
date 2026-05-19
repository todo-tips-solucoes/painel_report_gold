import * as XLSX from "xlsx";
import { porOrigemQuerySchema } from "@/schemas/por-origem";
import { fetchPorOrigemAll } from "@/lib/por-origem";
import { fmtDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = porOrigemQuerySchema.safeParse(
    Object.fromEntries(url.searchParams),
  );
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const q = parsed.data;
  const format = (url.searchParams.get("format") || "xlsx").toLowerCase();

  try {
    const { rows } = await fetchPorOrigemAll(q);
    const data = rows.map((r) => ({
      "Contato": r.name ?? "",
      "Telefone": r.number ?? "",
      "Data cadastro": fmtDateTime(r.createdAt),
      "Tags CRM": r.tags_crm.join(", "),
      "Médico(s)": r.medicos.join(", "),
    }));

    // Node Buffer compartilha ArrayBufferLike (possivelmente SharedArrayBuffer)
    // enquanto BodyInit/Blob exige ArrayBuffer puro. Copiamos os bytes para
    // garantir um ArrayBuffer próprio antes de devolver.
    const toArrayBuffer = (b: Buffer): ArrayBuffer => {
      const out = new ArrayBuffer(b.byteLength);
      new Uint8Array(out).set(b);
      return out;
    };

    if (format === "csv") {
      const ws = XLSX.utils.json_to_sheet(data);
      const csv = XLSX.utils.sheet_to_csv(ws, { FS: ";" });
      const buf = Buffer.from("﻿" + csv, "utf8"); // BOM para Excel pt-BR
      return new Response(toArrayBuffer(buf), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="por-origem-${q.companyId}-${q.from}-a-${q.to}.csv"`,
        },
      });
    }

    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [
      { wch: 32 },
      { wch: 16 },
      { wch: 20 },
      { wch: 40 },
      { wch: 50 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Por Origem");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
    return new Response(toArrayBuffer(buf), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="por-origem-${q.companyId}-${q.from}-a-${q.to}.xlsx"`,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 502 });
  }
}
