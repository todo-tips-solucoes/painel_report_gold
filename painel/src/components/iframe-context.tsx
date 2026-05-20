"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { iframeParamsSchema, type IframeParams } from "@/lib/iframe-params";

const Ctx = React.createContext<IframeParams | null>(null);

/**
 * Lê um param tolerando URL malformada do app pai. O `src` do iframe vem com
 * `??companyId=20` em vez de `?companyId=20`, fazendo o navegador interpretar
 * o nome do primeiro param como `"?companyId"`. Procuramos a chave canônica e
 * variantes com `?` ou whitespace no prefixo. Quando o app pai consertar, esta
 * normalização vira no-op.
 */
function readParam(search: URLSearchParams, key: string): string {
  const direct = search.get(key);
  if (direct !== null && direct !== "") return direct;
  for (const [k, v] of search.entries()) {
    if (k.replace(/^[?\s]+/, "") === key && v !== "") return v;
  }
  return "";
}

export function IframeContextProvider({ children }: { children: React.ReactNode }) {
  const search = useSearchParams();
  const raw = {
    companyId: readParam(search, "companyId"),
    backendURL: readParam(search, "backendURL"),
    user_LoggedName: readParam(search, "user_LoggedName"),
    user_LoggedLevel: readParam(search, "user_LoggedLevel") || "user",
  };
  const parsed = iframeParamsSchema.safeParse(raw);
  if (!parsed.success) {
    return (
      <div className="p-6 text-sm text-destructive">
        Parâmetros do iframe inválidos.
        <pre className="mt-2 text-xs text-muted-foreground overflow-auto">
          {JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)}
        </pre>
      </div>
    );
  }
  return <Ctx.Provider value={parsed.data}>{children}</Ctx.Provider>;
}

export function useIframeParams(): IframeParams {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useIframeParams must be used inside IframeContextProvider");
  return ctx;
}
