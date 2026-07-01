import type {
  NetWorthAssetsBreakdown,
  NetWorthLiabilitiesBreakdown,
} from "@/types/financial.types";

export function sumAssets(assets: NetWorthAssetsBreakdown): number {
  return (
    assets.cash +
    assets.investments +
    assets.realEstate +
    assets.business +
    assets.vehicles +
    assets.other
  );
}

export function sumLiabilities(liabilities: NetWorthLiabilitiesBreakdown): number {
  return (
    liabilities.mortgage +
    liabilities.carLoan +
    liabilities.creditCard +
    liabilities.businessDebt +
    liabilities.other
  );
}

export function computeNetWorthTotals(
  assets: NetWorthAssetsBreakdown,
  liabilities: NetWorthLiabilitiesBreakdown,
) {
  const totalAssets = sumAssets(assets);
  const totalLiabilities = sumLiabilities(liabilities);
  const netWorth = totalAssets - totalLiabilities;
  const liquidNetWorth = assets.cash + assets.investments;
  const debtToAssetRatio = totalAssets > 0 ? totalLiabilities / totalAssets : 0;
  return { totalAssets, totalLiabilities, netWorth, liquidNetWorth, debtToAssetRatio };
}

/** Simple scenario simulation: project net worth forward by monthly cashflow delta. */
export function runScenarioSimulation(opts: {
  currentNetWorth: number;
  monthlyCashflowDelta: number;
  horizonMonths: number;
}): { month: string; netWorth: number }[] {
  const { currentNetWorth, monthlyCashflowDelta, horizonMonths } = opts;
  const series: { month: string; netWorth: number }[] = [];
  let nw = currentNetWorth;
  const now = new Date();
  for (let i = 0; i <= horizonMonths; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    series.push({ month: label, netWorth: Math.round(nw) });
    nw += monthlyCashflowDelta;
  }
  return series;
}
