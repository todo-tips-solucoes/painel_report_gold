"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useIframeParams } from "@/components/iframe-context";
import { useCompany, companyLabel } from "@/components/use-company";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/por-origem", label: "Por Origem" },
  { href: "/atendimento", label: "Atendimento" },
  { href: "/conexoes", label: "Conexões" },
  { href: "/pipeline", label: "Pipeline" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const params = useIframeParams();
  const pathname = usePathname();
  const search = useSearchParams();
  const qs = search.toString();
  const { data: company } = useCompany(params.companyId);
  const label = companyLabel(company, params.companyId);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-background">
        <div className="px-4 md:px-6 py-3 flex flex-wrap items-center gap-4">
          <div
            className="font-semibold text-sm max-w-[40ch] truncate"
            title={company?.namecomplete || company?.name || undefined}
          >
            <span className="text-primary">{label}</span>
          </div>
          <nav className="flex flex-wrap gap-1">
            {NAV.map((n) => {
              const active = pathname === n.href;
              const href = qs ? `${n.href}?${qs}` : n.href;
              return (
                <Link
                  key={n.href}
                  href={href}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground",
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto text-xs text-muted-foreground">
            {params.user_LoggedName ? (
              <>
                <span>{params.user_LoggedName}</span>
                <span className="mx-1.5">·</span>
                <span className="uppercase tracking-wide">{params.user_LoggedLevel}</span>
              </>
            ) : null}
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 md:px-6 py-6">{children}</main>
    </div>
  );
}
