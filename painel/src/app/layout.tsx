import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Providers } from "./providers";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Painel Relatórios",
  description: "Painel embedável de relatórios do chat/CRM",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-muted/30 text-foreground">
        <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Carregando…</div>}>
          <Providers>
            <AppShell>{children}</AppShell>
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}
