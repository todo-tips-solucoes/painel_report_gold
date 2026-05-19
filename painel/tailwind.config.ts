import type { Config } from "tailwindcss";

// Neutros tintados pela hue azul-slate da marca (264°-ish em OKLCH, ~220 em HSL).
// Banimos #fff/#000 puros: cada neutro carrega tinta da hue primária.
// Equivalente OKLCH (canonical, documentado em DESIGN.md):
//   background       ≈ oklch(99% 0.003 264)
//   muted            ≈ oklch(97% 0.012 264)
//   primary-foreground ≈ oklch(98% 0.005 264)
// Mantemos HSL aqui para máxima compatibilidade entre browsers.

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(220 13% 91%)",
        background: "hsl(220 33% 99.2%)",
        foreground: "hsl(222 47% 11%)",
        muted: "hsl(220 33% 96%)",
        "muted-foreground": "hsl(215 16% 47%)",
        primary: "hsl(221 83% 53%)",
        "primary-foreground": "hsl(220 33% 98.5%)",
        destructive: "hsl(0 84% 60%)",
        success: "hsl(142 71% 45%)",
        warning: "hsl(38 92% 50%)",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
