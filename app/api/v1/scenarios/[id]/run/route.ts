import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { runScenarioSimulation } from "@/lib/financial-calculations";
import type { ScenarioParameters } from "@/types/scenario.types";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;

  const scenario = await prisma.scenario.findFirst({ where: { id, userId } });
  if (!scenario) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const latest = await prisma.netWorthSnapshot.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
  });
  const currentNetWorth = latest?.netWorth ?? 0;

  const params_ = scenario.parameters as ScenarioParameters;
  const incomeDelta = (params_.incomeDeltaPercent ?? 0) / 100;
  const horizonMonths = params_.horizonMonths ?? 12;

  // Rough monthly delta from income change on current net worth baseline.
  const monthlyCashflowDelta = currentNetWorth * incomeDelta * 0.01;

  const series = runScenarioSimulation({
    currentNetWorth,
    monthlyCashflowDelta,
    horizonMonths,
  });

  const results = {
    netWorthDelta: series[series.length - 1]?.netWorth - currentNetWorth,
    monthlyCashflowDelta,
    summary: `Прогноз на ${horizonMonths} мес. при изменении дохода ${params_.incomeDeltaPercent ?? 0}%`,
    series,
  };

  const updated = await prisma.scenario.update({
    where: { id },
    data: { results },
  });

  return NextResponse.json({ scenario: updated, results });
}
