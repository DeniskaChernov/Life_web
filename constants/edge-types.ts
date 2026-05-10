// LIFE_MASTER_BLUEPRINT.md — section 4.2

export const EDGE_TYPE_VALUES = [
  "RELATED",
  "REQUIRES",
  "BLOCKS",
  "SUPPORTS",
  "FUNDS",
  "ALLOCATES_TO",
  "GENERATES",
  "RISKS",
  "CONFLICTS",
  "CHILD_OF",
  "DEPENDS_ON",
  "MEASURES",
  "INFLUENCES",
] as const;
export type EdgeType = (typeof EDGE_TYPE_VALUES)[number];

export const EDGE_DIRECTION_VALUES = ["FORWARD", "BIDIRECTIONAL", "BACKWARD"] as const;
export type EdgeDirection = (typeof EDGE_DIRECTION_VALUES)[number];

export const EDGE_TYPE_LABELS: Record<EdgeType, string> = {
  RELATED: "Связано",
  REQUIRES: "Требует",
  BLOCKS: "Блокирует",
  SUPPORTS: "Поддерживает",
  FUNDS: "Финансирует",
  ALLOCATES_TO: "Распределяет",
  GENERATES: "Генерирует",
  RISKS: "Риск",
  CONFLICTS: "Конфликт",
  CHILD_OF: "Дочерний",
  DEPENDS_ON: "Зависит",
  MEASURES: "Измеряет",
  INFLUENCES: "Влияет",
};

export const EDGE_TYPE_GROUPS: Record<string, EdgeType[]> = {
  Money: ["FUNDS", "ALLOCATES_TO", "GENERATES"],
  Risk: ["RISKS", "CONFLICTS", "BLOCKS"],
  Logic: ["REQUIRES", "DEPENDS_ON", "SUPPORTS"],
  Hierarchy: ["CHILD_OF"],
  Other: ["RELATED", "MEASURES", "INFLUENCES"],
};

export const ANIMATED_EDGE_TYPES: ReadonlySet<EdgeType> = new Set([
  "FUNDS",
  "ALLOCATES_TO",
  "GENERATES",
]);

export interface EdgeStyle {
  stroke: string;
  strokeWidth: number;
  dashArray?: string;
  opacity: number;
}

export const EDGE_STYLES: Record<EdgeType, EdgeStyle> = {
  RELATED: { stroke: "#475569", strokeWidth: 1.4, opacity: 0.65 },
  REQUIRES: { stroke: "#94A3B8", strokeWidth: 1.6, dashArray: "6 4", opacity: 0.85 },
  BLOCKS: { stroke: "#EF4444", strokeWidth: 2, dashArray: "2 4", opacity: 0.9 },
  SUPPORTS: { stroke: "#22D3EE", strokeWidth: 1.8, opacity: 0.8 },
  FUNDS: { stroke: "#10B981", strokeWidth: 2.2, dashArray: "8 4", opacity: 0.95 },
  ALLOCATES_TO: { stroke: "#34D399", strokeWidth: 2, dashArray: "8 4", opacity: 0.9 },
  GENERATES: { stroke: "#F59E0B", strokeWidth: 2.2, dashArray: "8 4", opacity: 0.95 },
  RISKS: { stroke: "#F87171", strokeWidth: 1.8, dashArray: "1 5", opacity: 0.8 },
  CONFLICTS: { stroke: "#FB7185", strokeWidth: 2, dashArray: "1 6", opacity: 0.85 },
  CHILD_OF: { stroke: "#64748B", strokeWidth: 1.2, opacity: 0.45 },
  DEPENDS_ON: { stroke: "#A78BFA", strokeWidth: 1.6, dashArray: "4 4", opacity: 0.8 },
  MEASURES: { stroke: "#FACC15", strokeWidth: 1.4, opacity: 0.75 },
  INFLUENCES: { stroke: "#E879F9", strokeWidth: 1.4, opacity: 0.7 },
};

export const EDGE_CULLING_PRIORITY_TYPES: ReadonlySet<EdgeType> = new Set([
  "FUNDS",
  "ALLOCATES_TO",
  "GENERATES",
  "RISKS",
  "CONFLICTS",
  "BLOCKS",
]);
