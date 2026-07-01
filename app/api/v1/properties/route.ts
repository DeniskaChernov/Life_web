import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { PROPERTY_TYPE_VALUES, PROPERTY_LIFECYCLE_VALUES } from "@/types/property.types";

const createSchema = z.object({
  nodeId: z.string().min(1),
  type: z.enum(PROPERTY_TYPE_VALUES),
  address: z.record(z.string(), z.unknown()),
  areaSqm: z.number().positive().optional(),
  floor: z.number().int().optional(),
  totalFloors: z.number().int().optional(),
  yearBuilt: z.number().int().optional(),
  purchasePrice: z.number().min(0).optional(),
  purchaseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  currentEstimatedValue: z.number().min(0).optional(),
  lastValuationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  mortgageData: z.unknown().optional(),
  rentalData: z.unknown().optional(),
  monthlyExpenses: z.unknown().optional(),
  lifecycleStatus: z.enum(PROPERTY_LIFECYCLE_VALUES).optional(),
});

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const properties = await prisma.property.findMany({
    where: { userId },
    include: { node: { select: { id: true, title: true, category: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ properties });
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
  const node = await prisma.node.findFirst({ where: { id: d.nodeId, userId } });
  if (!node) return NextResponse.json({ error: "NODE_NOT_FOUND" }, { status: 404 });

  const existing = await prisma.property.findUnique({ where: { nodeId: d.nodeId } });
  if (existing) return NextResponse.json({ error: "PROPERTY_EXISTS" }, { status: 409 });

  const property = await prisma.property.create({
    data: {
      userId,
      nodeId: d.nodeId,
      type: d.type,
      address: d.address as Prisma.InputJsonValue,
      areaSqm: d.areaSqm ?? null,
      floor: d.floor ?? null,
      totalFloors: d.totalFloors ?? null,
      yearBuilt: d.yearBuilt ?? null,
      purchasePrice: d.purchasePrice ?? null,
      purchaseDate: d.purchaseDate ? new Date(d.purchaseDate) : null,
      currentEstimatedValue: d.currentEstimatedValue ?? null,
      lastValuationDate: d.lastValuationDate ? new Date(d.lastValuationDate) : null,
      mortgageData: (d.mortgageData as object | undefined) ?? undefined,
      rentalData: (d.rentalData as object | undefined) ?? undefined,
      monthlyExpenses: (d.monthlyExpenses as object | undefined) ?? undefined,
      lifecycleStatus: d.lifecycleStatus ?? "PLANNING",
    },
    include: { node: { select: { id: true, title: true } } },
  });

  return NextResponse.json({ property }, { status: 201 });
}
