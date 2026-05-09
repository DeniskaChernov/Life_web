import type { Edge, Node } from "@xyflow/react";
import type { Edge as DbEdge, Node as DbNode } from "@prisma/client";

export type LifeNodeData = { db: DbNode };

export type LifeFlowNode = Node<LifeNodeData, "life">;

export type LifeFlowEdge = Edge;

export function toFlowNode(n: DbNode): LifeFlowNode {
  return {
    id: n.id,
    type: "life",
    position: { x: n.positionX, y: n.positionY },
    data: { db: n },
  };
}

export function toFlowEdge(e: DbEdge): LifeFlowEdge {
  return {
    id: e.id,
    source: e.sourceId,
    target: e.targetId,
    label: e.label ?? undefined,
  };
}
