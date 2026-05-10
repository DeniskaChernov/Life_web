import type { EdgeType, EdgeDirection } from "@/constants/edge-types";

export type { EdgeType, EdgeDirection };

export interface EdgeFinancialFlow {
  amount?: number;
  currency?: string;
  cadence?: "ONCE" | "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";
}
