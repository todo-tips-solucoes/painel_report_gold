import { pgrstGet } from "./pgrst";
import { cacheGet, cacheSet } from "./cache";
import type { Company } from "@/schemas/company";

// Nome da empresa muda raramente. 1h de TTL é seguro.
const TTL_MS = 60 * 60_000;

type CompanyRaw = {
  id: number;
  name: string;
  namecomplete: string | null;
};

export async function fetchCompany(companyId: number): Promise<Company | null> {
  const key = `company|${companyId}`;
  const cached = cacheGet<Company>(key);
  if (cached) return cached;

  const r = await pgrstGet<CompanyRaw[]>(
    `/Companies?id=eq.${companyId}&select=id,name,namecomplete&limit=1`,
  );
  const row = r.data[0];
  if (!row) return null; // não cacheia null — re-fetch da próxima vez se vier dado
  const result: Company = {
    id: row.id,
    name: row.name,
    namecomplete: row.namecomplete,
  };
  cacheSet(key, result, TTL_MS);
  return result;
}
