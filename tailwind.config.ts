import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          void: "#05060B",
          base: "#080B14",
          surface: "#0F1424",
          elevated: "#161B2E",
        },
        node: {
          self: "#FFFFFF",
          goal: "#6366F1",
          project: "#3B82F6",
          task: "#0EA5E9",
          habit: "#22D3EE",
          asset: "#10B981",
          financial: "#F59E0B",
          income: "#34D399",
          expense: "#FB7185",
          risk: "#EF4444",
          opportunity: "#A78BFA",
          relationship: "#F472B6",
          skill: "#FACC15",
          event: "#FB923C",
          insight: "#E879F9",
          note: "#94A3B8",
        },
        status: {
          active: "#34D399",
          paused: "#FBBF24",
          blocked: "#F87171",
          completed: "#60A5FA",
          archived: "#64748B",
          future: "#A78BFA",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Inter", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        "node-hero": ["20px", { lineHeight: "1.15", letterSpacing: "-0.01em", fontWeight: "700" }],
        "node-title": ["14px", { lineHeight: "1.25", fontWeight: "600" }],
        "node-meta": ["10px", { lineHeight: "1", letterSpacing: "0.08em", fontWeight: "600" }],
        "node-progress": ["11px", { lineHeight: "1", fontWeight: "500" }],
        "fin-lg": ["18px", { lineHeight: "1.1", letterSpacing: "-0.01em", fontWeight: "600" }],
        "fin-md": ["14px", { lineHeight: "1.1", fontWeight: "600" }],
        "fin-sm": ["11px", { lineHeight: "1", fontWeight: "500" }],
      },
      boxShadow: {
        glass: "0 18px 60px -16px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(148,163,184,0.12)",
        "glass-strong": "0 24px 80px -20px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(148,163,184,0.22)",
        "glow-sm": "0 0 12px rgba(99,102,241,0.4)",
        "glow-md": "0 0 24px rgba(99,102,241,0.55)",
        "glow-lg": "0 0 48px rgba(99,102,241,0.7)",
      },
      backdropBlur: {
        xs: "4px",
        glass: "16px",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.7", filter: "blur(0px)" },
          "50%": { opacity: "1", filter: "blur(1px)" },
        },
        "edge-flow": {
          "0%": { strokeDashoffset: "0" },
          "100%": { strokeDashoffset: "-24" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
        "edge-flow": "edge-flow 1.6s linear infinite",
        "fade-in-up": "fade-in-up 0.32s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
