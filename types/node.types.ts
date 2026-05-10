import type {
  NodeCategory,
  NodeStatus,
  NodePriority,
  NodeSize,
  TimeHorizon,
  NodeEnergy,
} from "@/constants/node-categories";

export type { NodeCategory, NodeStatus, NodePriority, NodeSize, TimeHorizon, NodeEnergy };

export interface AiInsight {
  type: "warning" | "suggestion" | "praise" | "question";
  text: string;
  confidence?: number;
  createdAt: string;
}

export interface NodeAiMetadata {
  insights?: AiInsight[];
  nextAction?: string;
  blockers?: string[];
}
