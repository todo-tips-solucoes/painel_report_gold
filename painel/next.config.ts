import type { NextConfig } from "next";

const allowed = (process.env.ALLOWED_IFRAME_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const frameAncestors = allowed.length > 0 ? allowed.join(" ") : "'self'";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${frameAncestors};`,
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
