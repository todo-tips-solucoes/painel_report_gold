import { NextResponse, type NextRequest } from "next/server";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

/**
 * Monta `frame-ancestors` em runtime — não em build time como o next.config.ts
 * fazia. No Docker, `.env` está no `.dockerignore`, então durante `next build`
 * ALLOWED_IFRAME_ORIGINS era vazio e o header ficava sempre `'self'` mesmo com
 * a env populada via env_file em runtime.
 */
function frameAncestorsHeader(): string {
  const raw = process.env.ALLOWED_IFRAME_ORIGINS ?? "";
  const origins = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return origins.length > 0 ? origins.join(" ") : "'self'";
}

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set(
    "Content-Security-Policy",
    `frame-ancestors ${frameAncestorsHeader()};`,
  );
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return res;
}

export function middleware(req: NextRequest) {
  // Healthcheck passa direto, sem CSP (Docker healthcheck não precisa).
  if (req.nextUrl.pathname === "/api/health") return NextResponse.next();

  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;

  // Basic Auth opcional: ativa apenas se AMBAS as envs estiverem setadas.
  if (user && pass) {
    const auth = req.headers.get("authorization") || "";
    let authorized = false;
    if (auth.startsWith("Basic ")) {
      try {
        const decoded = atob(auth.slice(6));
        const sep = decoded.indexOf(":");
        if (decoded.slice(0, sep) === user && decoded.slice(sep + 1) === pass) {
          authorized = true;
        }
      } catch {}
    }
    if (!authorized) {
      return new NextResponse("Autenticação requerida", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Painel Relatórios", charset="UTF-8"',
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }
  }

  return applySecurityHeaders(NextResponse.next());
}
