import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { computeNetWorthTotals } from "@/lib/financial-calculations";

const assetsSchema = z.object({
  cash: z.number().min(0).default(0),
  investments: z.number().min(0).default(0),
  realEstate: z.number().min(0).default(0),
  business: z.number().min(0).default(0),
  vehicles: z.number().min(0).default(0),
  other: z.number().min(0).default(0),
});

const liabilitiesSchema = z.object({
  mortgage: z.number().min(0).default(0),
  carLoan: z.number().min(0).default(0),
  creditCard: z.number().min(0).default(0),
  businessDebt: z.number().min(0).default(0),
  other: z.number().min(0).default(0),
});

const dateSchema = z.union([
  z.string().datetime(),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
]);

const createSchema = z.object({
  date: dateSchema,
  assets: assetsSchema,
  liabilities: liabilitiesSchema,
  notes: z.string().max(1000).optional(),
});

export async function GET(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 24), 120);

  const snapshots = await prisma.netWorthSnapshot.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: limit,
  });

  return NextResponse.json({ snapshots: snapshots.reverse() });
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { date, assets, liabilities, notes } = parsed.data;
  const totals = computeNetWorthTotals(assets, liabilities);

  const snapshot = await prisma.netWorthSnapshot.upsert({
    where: { userId_date: { userId, date: new Date(date) } },
    update: {
      assets,
      liabilities,
      totalAssets: totals.totalAssets,
      totalLiabilities: totals.totalLiabilities,
      netWorth: totals.netWorth,
      notes: notes ?? null,
    },
    create: {
      userId,
      date: new Date(date),
      assets,
      liabilities,
      totalAssets: totals.totalAssets,
      totalLiabilities: totals.totalLiabilities,
      netWorth: totals.netWorth,
      notes: notes ?? null,
    },
  });

  return NextResponse.json({ snapshot }, { status: 201 });
}
