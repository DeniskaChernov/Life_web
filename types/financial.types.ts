export interface FinancialNodeData {
  amount: number;
  currency: string;
  cadence?: "ONCE" | "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";
  category?: string;
  notes?: string;
}

export interface NetWorthAssets {
  liquid: number;
  realEstate: number;
  investments: number;
  other: number;
  total: number;
}
