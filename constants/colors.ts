// LIFE_MASTER_BLUEPRINT.md — section 2.1, 5.7 (color tokens)

export const LIFE_COLORS = {
  bg: {
    void: "#05060B", // deepest space
    base: "#080B14", // app background
    surface: "#0F1424", // panels
    elevated: "#161B2E", // cards, popovers
    overlay: "rgba(8, 11, 20, 0.78)", // glassmorphism backdrop
  },
  text: {
    hero: "#F8FAFC",
    primary: "#E2E8F0",
    secondary: "#94A3B8",
    muted: "#64748B",
    inverse: "#0F172A",
  },
  border: {
    soft: "rgba(255,255,255,0.06)",
    medium: "rgba(255,255,255,0.12)",
    strong: "rgba(255,255,255,0.22)",
  },
  glass: {
    panel: "rgba(15, 20, 36, 0.62)",
    panelStrong: "rgba(15, 20, 36, 0.84)",
    border: "rgba(148, 163, 184, 0.18)",
  },
  status: {
    active: "#34D399",
    paused: "#FBBF24",
    blocked: "#F87171",
    completed: "#60A5FA",
    archived: "#64748B",
    future: "#A78BFA",
  },
  accent: {
    primary: "#6366F1",
    money: "#10B981",
    risk: "#EF4444",
    insight: "#E879F9",
  },
} as const;

export type LifeColorPath = string; // dotted path like "bg.base"
