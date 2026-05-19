import { createHmac } from "node:crypto";
import { env } from "./env";

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

type SignedToken = { token: string; expiresAt: number };

let cached: SignedToken | null = null;

export function signPgrstJwt(ttlSeconds = 60 * 60): SignedToken {
  const now = Math.floor(Date.now() / 1000);
  if (cached && cached.expiresAt - now > 60) return cached;

  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({ role: env.PGRST_ROLE, exp: now + ttlSeconds }),
  );
  const signature = b64url(
    createHmac("sha256", env.PGRST_JWT_SECRET).update(`${header}.${payload}`).digest(),
  );
  cached = { token: `${header}.${payload}.${signature}`, expiresAt: now + ttlSeconds };
  return cached;
}
