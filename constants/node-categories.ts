export const NODE_CATEGORY_VALUES = [
  "GOAL",
  "PROJECT",
  "ASSET",
  "FINANCIAL",
  "RISK",
  "NOTE",
] as const;

export type NodeCategory = (typeof NODE_CATEGORY_VALUES)[number];

export const NODE_COLORS: Record<NodeCategory, string> = {
  GOAL: "#6366F1",
  PROJECT: "#3B82F6",
  ASSET: "#10B981",
  FINANCIAL: "#F59E0B",
  RISK: "#EF4444",
  NOTE: "#475569",
};
