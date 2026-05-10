import type { Edge, Node } from "@xyflow/react";
import type { Edge as DbEdge, Node as DbNode } from "@prisma/client";
import type { NodeCategory } from "@/constants/node-categories";
import type { EdgeType } from "@/constants/edge-types";

export type LifeNodeKind = "self" | "financial" | "base";
export type LifeEdgeKind = "funds" | "risks" | "base";

export type LifeNodeData = { db: DbNode };
export type LifeEdgeData = { db: DbEdge };

export type LifeFlowNode = Node<LifeNodeData, LifeNodeKind>;
export type LifeFlowEdge = Edge<LifeEdgeData, LifeEdgeKind>;

export function nodeKindFromCategory(category: string): LifeNodeKind {
  const c = category as NodeCategory;
  if (c === "SELF") return "self";
  if (c === "FINANCIAL" || c === "INCOME" || c === "EXPENSE" || c === "ASSET") return "financial";
  return "base";
}

export function edgeKindFromType(type: string): LifeEdgeKind {
  const t = type as EdgeType;
  if (t === "FUNDS" || t === "ALLOCATES_TO" || t === "GENERATES") return "funds";
  if (t === "RISKS" || t === "CONFLICTS" || t === "BLOCKS") return "risks";
  return "base";
}

export function toFlowNode(n: DbNode): LifeFlowNode {
  return {
    id: n.id,
    type: nodeKindFromCategory(n.category),
    position: { x: n.positionX, y: n.positionY },
    data: { db: n },
  };
}

export function toFlowEdge(e: DbEdge): LifeFlowEdge {
  return {
    id: e.id,
    type: edgeKindFromType(e.type),
    source: e.sourceId,
    target: e.targetId,
    data: { db: e },
    label: e.label ?? undefined,
  };
}
