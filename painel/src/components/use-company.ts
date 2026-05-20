"use client";

import { useQuery } from "@tanstack/react-query";
import type { Company } from "@/schemas/company";

/**
 * Busca metadados da empresa (nome, namecomplete) pelo companyId.
 * Cache de 1h via Tanstack Query — o nome muda raramente.
 * Compartilhado entre app-shell e todas as pages: o mesmo companyId
 * dispara uma única query mesmo que múltiplos componentes leiam.
 */
export function useCompany(companyId: number | undefined) {
  return useQuery<Company>({
    queryKey: ["company", companyId],
    queryFn: async () => {
      const r = await fetch(`/api/company?companyId=${companyId}`);
      if (!r.ok) throw new Error(`Falha ${r.status}: ${await r.text()}`);
      return r.json();
    },
    enabled: !!companyId,
    staleTime: 60 * 60_000, // 1h
  });
}

/**
 * Rótulo human-friendly da empresa: usa `company.name` (razão social) quando
 * disponível, ou fallback para `#${id}` enquanto o nome ainda não chegou.
 */
export function companyLabel(
  company: Company | undefined,
  companyId: number | undefined,
): string {
  if (company?.name) return company.name;
  return companyId ? `#${companyId}` : "";
}
