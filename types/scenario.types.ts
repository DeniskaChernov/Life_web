export const SCENARIO_TYPE_VALUES = [
  "CUSTOM",
  "INCOME_CHANGE",
  "RATE_CHANGE",
  "PROPERTY_PURCHASE",
  "EARLY_PAYOFF",
] as const;
export type ScenarioType = (typeof SCENARIO_TYPE_VALUES)[number];

export interface ScenarioParameters {
  /** e.g. +20% income */
  incomeDeltaPercent?: number;
  /** e.g. mortgage rate change */
  interestRateDelta?: number;
  /** months to simulate forward */
  horizonMonths?: number;
  /** custom knobs */
  [key: string]: unknown;
}

export interface ScenarioResults {
  netWorthDelta?: number;
  monthlyCashflowDelta?: number;
  summary?: string;
  series?: { month: string; netWorth: number }[];
}

export interface ScenarioInput {
  name: string;
  description?: string;
  type?: ScenarioType;
  parameters: ScenarioParameters;
  color?: string;
  isActive?: boolean;
}
