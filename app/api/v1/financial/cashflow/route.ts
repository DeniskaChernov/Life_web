import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { CASHFLOW_TYPE_VALUES } from "@/types/financial.types";

const dateSchema = z.union([
  z.string().datetime(),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
]);

const createSchema = z.object({
  date: dateSchema,
  type: z.enum(CASHFLOW_TYPE_VALUES),
  amount: z.number().positive(),
  currency: z.string().max(10).default("RUB"),
  category: z.string().max(100),
  subcategory: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  linkedNodeId: z.string().optional().nullable(),
  isRecurring: z.boolean().default(false),
  isActual: z.boolean().default(true),
});

export async function GET(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200);
  const days = Number(url.searchParams.get("days") ?? 90);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const entries = await prisma.cashflowEntry.findMany({
    where: { userId, date: { gte: since } },
    orderBy: { date: "desc" },
    take: limit,
    include: { linkedNode: { select: { id: true, title: true } } },
  });

  return NextResponse.json({ entries });
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

  const d = parsed.data;

  if (d.linkedNodeId) {
    const node = await prisma.node.findFirst({ where: { id: d.linkedNodeId, userId } });
    if (!node) return NextResponse.json({ error: "NODE_NOT_FOUND" }, { status: 404 });
  }

  const entry = await prisma.cashflowEntry.create({
    data: {
      userId,
      date: new Date(d.date),
      type: d.type,
      amount: d.amount,
      currency: d.currency,
      category: d.category,
      subcategory: d.subcategory ?? null,
      description: d.description ?? null,
      linkedNodeId: d.linkedNodeId ?? null,
      isRecurring: d.isRecurring,
      isActual: d.isActual,
    },
  });

  return NextResponse.json({ entry }, { status: 201 });
}
