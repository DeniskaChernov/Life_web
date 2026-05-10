// LIFE_MASTER_BLUEPRINT.md — section 5.3 (Level of Detail by zoom)

import type { NodeCategory } from "@/constants/node-categories";

export type ZoomLevel = "galaxy" | "system" | "planet" | "surface";

export interface ZoomPreset {
  level: ZoomLevel;
  /** Lower bound (exclusive) of zoom factor for this preset. */
  minZoom: number;
  /** Show node titles? */
  showTitle: boolean;
  /** Show meta line (category badge, tags)? */
  showMeta: boolean;
  /** Show progress bar / financial numbers? */
  showDetail: boolean;
  /** Show edge labels? */
  showEdgeLabel: boolean;
  /** Categories visible at this preset (others are dimmed/hidden). */
  visibleCategories: ReadonlySet<NodeCategory> | "ALL";
}

const ALL = "ALL" as const;

export const ZOOM_PRESETS: ZoomPreset[] = [
  {
    level: "surface",
    minZoom: 1.4,
    showTitle: true,
    showMeta: true,
    showDetail: true,
    showEdgeLabel: true,
    visibleCategories: ALL,
  },
  {
    level: "planet",
    minZoom: 0.85,
    showTitle: true,
    showMeta: true,
    showDetail: false,
    showEdgeLabel: true,
    visibleCategories: ALL,
  },
  {
    level: "system",
    minZoom: 0.45,
    showTitle: true,
    showMeta: false,
    showDetail: false,
    showEdgeLabel: false,
    visibleCategories: new Set<NodeCategory>([
      "SELF",
      "GOAL",
      "PROJECT",
      "ASSET",
      "FINANCIAL",
      "INCOME",
      "RISK",
      "RELATIONSHIP",
    ]),
  },
  {
    level: "galaxy",
    minZoom: 0,
    showTitle: false,
    showMeta: false,
    showDetail: false,
    showEdgeLabel: false,
    visibleCategories: new Set<NodeCategory>(["SELF", "GOAL", "ASSET", "FINANCIAL"]),
  },
];

export function getZoomPreset(zoom: number): ZoomPreset {
  for (const p of ZOOM_PRESETS) {
    if (zoom >= p.minZoom) return p;
  }
  return ZOOM_PRESETS[ZOOM_PRESETS.length - 1];
}

export function isCategoryVisibleAtPreset(category: NodeCategory, preset: ZoomPreset): boolean {
  if (preset.visibleCategories === "ALL") return true;
  return preset.visibleCategories.has(category);
}

/** Below this zoom, low-priority edges are hidden entirely. */
export const EDGE_CULLING_ZOOM_THRESHOLD = 0.55;
