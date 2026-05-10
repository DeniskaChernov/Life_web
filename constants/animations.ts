// LIFE_MASTER_BLUEPRINT.md — section 5.2, 5.5 (cinematic transitions, "no teleportation")

export const ANIMATION_CONFIG = {
  spring: {
    soft: { type: "spring" as const, stiffness: 220, damping: 28, mass: 0.7 },
    snappy: { type: "spring" as const, stiffness: 360, damping: 32, mass: 0.6 },
    crisp: { type: "spring" as const, stiffness: 480, damping: 38, mass: 0.5 },
  },
  tween: {
    fast: { type: "tween" as const, duration: 0.18, ease: [0.32, 0.72, 0, 1] },
    base: { type: "tween" as const, duration: 0.28, ease: [0.32, 0.72, 0, 1] },
    slow: { type: "tween" as const, duration: 0.48, ease: [0.22, 0.61, 0.36, 1] },
    cinematic: { type: "tween" as const, duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
  camera: {
    flyToNode: 700, // ms
    flyHome: 900,
    overview: 1100,
  },
  stagger: {
    children: 0.04, // s between siblings
    nodes: 0.025,
  },
  maxFrameDurationMs: 1200,
} as const;
