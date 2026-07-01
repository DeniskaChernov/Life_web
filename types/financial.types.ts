export interface FinancialNodeData {
  amount: number;
  currency: string;
  cadence?: "ONCE" | "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";
  category?: string;
  notes?: string;
}

export const CASHFLOW_TYPE_VALUES = ["income", "expense", "transfer", "investment"] as const;
export type CashflowType = (typeof CASHFLOW_TYPE_VALUES)[number];

export const CASHFLOW_CATEGORY_VALUES = [
  "SALARY",
  "BUSINESS_INCOME",
  "RENTAL_INCOME",
  "INVESTMENT_INCOME",
  "HOUSING",
  "FOOD",
  "TRANSPORT",
  "EDUCATION",
  "HEALTHCARE",
  "ENTERTAINMENT",
  "SAVINGS",
  "DEBT_PAYMENT",
  "INVESTMENT",
  "BUSINESS_EXPENSE",
  "OTHER",
] as const;
export type CashflowCategory = (typeof CASHFLOW_CATEGORY_VALUES)[number];

export const CASHFLOW_CATEGORY_LABELS: Record<CashflowCategory, string> = {
  SALARY: "Зарплата",
  BUSINESS_INCOME: "Бизнес-доход",
  RENTAL_INCOME: "Аренда",
  INVESTMENT_INCOME: "Инвестиции",
  HOUSING: "Жильё",
  FOOD: "Еда",
  TRANSPORT: "Транспорт",
  EDUCATION: "Образование",
  HEALTHCARE: "Здоровье",
  ENTERTAINMENT: "Развлечения",
  SAVINGS: "Накопления",
  DEBT_PAYMENT: "Погашение долга",
  INVESTMENT: "Инвестиции",
  BUSINESS_EXPENSE: "Бизнес-расход",
  OTHER: "Прочее",
};

export interface NetWorthAssetsBreakdown {
  cash: number;
  investments: number;
  realEstate: number;
  business: number;
  vehicles: number;
  other: number;
}

export interface NetWorthLiabilitiesBreakdown {
  mortgage: number;
  carLoan: number;
  creditCard: number;
  businessDebt: number;
  other: number;
}

export interface NetWorthSnapshotInput {
  date: string;
  assets: NetWorthAssetsBreakdown;
  liabilities: NetWorthLiabilitiesBreakdown;
}

export interface CashflowEntryInput {
  date: string;
  type: CashflowType;
  amount: number;
  currency?: string;
  category: CashflowCategory;
  subcategory?: string;
  description?: string;
  linkedNodeId?: string | null;
  isRecurring?: boolean;
  isActual?: boolean;
}
