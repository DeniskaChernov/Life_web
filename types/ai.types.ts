export type AiInteractionKind = "CHAT" | "SUGGESTION" | "INSIGHT" | "PLAN";

export interface AiInteractionShape {
  id: string;
  userId: string;
  kind: AiInteractionKind;
  contextNodeId?: string | null;
  prompt?: string | null;
  response?: unknown;
  accepted?: boolean | null;
  createdAt: string;
}
