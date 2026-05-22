import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const assetsSchema = z.object({
  cash: z.number().default(0),
  investments: z.number().default(0),
  realEstate: z.number().default(0),
  business: z.number().default(0),
  vehicles: z.number().default(0),
  other: z.number().default(0),
});

const liabilitiesSchema = z.object({
  mortgage: z.number().default(0),
  carLoan: z.number().default(0),
  creditCard: z.number().default(0),
  businessDebt: z.number().default(0),
  other: z.number().default(0),
});

const createSchema = z.object({
  date: z.string().datetime(),
  assets: assetsSchema,
  liabilities: liabilitiesSchema,
  notes: z.string().max(1000).optional(),
});

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const snapshots = await prisma.netWorthSnapshot.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 24,
  });

  return NextResponse.json({ snapshots });
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
  const totalAssets = Object.values(assets).reduce((a, b) => a + b, 0);
  const totalLiabilities = Object.values(liabilities).reduce((a, b) => a + b, 0);
  const netWorth = totalAssets - totalLiabilities;

  const snapshot = await prisma.netWorthSnapshot.upsert({
    where: { userId_date: { userId, date: new Date(date) } },
    update: {
      assets,
      liabilities,
      totalAssets,
      totalLiabilities,
      netWorth,
      notes: notes ?? null,
    },
    create: {
      userId,
      date: new Date(date),
      assets,
      liabilities,
      totalAssets,
      totalLiabilities,
      netWorth,
      notes: notes ?? null,
    },
  });

  return NextResponse.json({ snapshot }, { status: 201 });
}
