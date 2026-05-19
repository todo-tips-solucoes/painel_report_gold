import { NextResponse, type NextRequest } from "next/server";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

export function middleware(req: NextRequest) {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;

  // Healthcheck e refresh interno passam direto (uso interno)
  if (req.nextUrl.pathname === "/api/health") return NextResponse.next();

  if (!user || !pass) return NextResponse.next();

  const auth = req.headers.get("authorization") || "";
  if (auth.startsWith("Basic ")) {
    try {
      const decoded = atob(auth.slice(6));
      const sep = decoded.indexOf(":");
      const u = decoded.slice(0, sep);
      const p = decoded.slice(sep + 1);
      if (u === user && p === pass) return NextResponse.next();
    } catch {}
  }
  return new NextResponse("Autenticação requerida", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Painel Relatórios", charset="UTF-8"',
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
