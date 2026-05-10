// LIFE_MASTER_BLUEPRINT.md — section 5.7 (typographic scale)

export const TYPOGRAPHY = {
  family: {
    display: "var(--font-display), 'Inter', system-ui, sans-serif",
    body: "var(--font-body), 'Inter', system-ui, sans-serif",
    mono: "var(--font-mono), 'JetBrains Mono', ui-monospace, monospace",
  },
  scale: {
    nodeHero: { size: "20px", weight: 700, tracking: "-0.01em", lineHeight: 1.15 },
    nodeTitle: { size: "14px", weight: 600, tracking: "0", lineHeight: 1.25 },
    nodeMeta: { size: "10px", weight: 600, tracking: "0.08em", lineHeight: 1, uppercase: true },
    nodeProgress: { size: "11px", weight: 500, tracking: "0", lineHeight: 1 },
    uiHeading: { size: "16px", weight: 600, tracking: "-0.005em", lineHeight: 1.3 },
    uiBody: { size: "13px", weight: 400, tracking: "0", lineHeight: 1.4 },
    uiCaption: { size: "11px", weight: 500, tracking: "0.04em", lineHeight: 1 },
    finLg: { size: "18px", weight: 600, tracking: "-0.01em", lineHeight: 1.1 },
    finMd: { size: "14px", weight: 600, tracking: "0", lineHeight: 1.1 },
    finSm: { size: "11px", weight: 500, tracking: "0", lineHeight: 1 },
  },
} as const;
