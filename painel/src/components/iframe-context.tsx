"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { iframeParamsSchema, type IframeParams } from "@/lib/iframe-params";

const Ctx = React.createContext<IframeParams | null>(null);

export function IframeContextProvider({ children }: { children: React.ReactNode }) {
  const search = useSearchParams();
  const raw = {
    companyId: search.get("companyId") ?? "",
    backendURL: search.get("backendURL") ?? "",
    user_LoggedName: search.get("user_LoggedName") ?? "",
    user_LoggedLevel: search.get("user_LoggedLevel") ?? "user",
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
