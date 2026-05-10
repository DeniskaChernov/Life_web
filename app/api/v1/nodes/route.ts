import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  NODE_CATEGORY_VALUES,
  NODE_STATUS_VALUES,
  NODE_PRIORITY_VALUES,
  NODE_SIZE_VALUES,
  TIME_HORIZON_VALUES,
  NODE_ENERGY_VALUES,
} from "@/constants/node-categories";

const createSchema = z.object({
  graphId: z.string().min(1),
  title: z.string().min(1).max(500),
  category: z.enum(NODE_CATEGORY_VALUES),
  subCategory: z.string().max(100).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(NODE_STATUS_VALUES).optional(),
  priority: z.enum(NODE_PRIORITY_VALUES).optional(),
  timeHorizon: z.enum(TIME_HORIZON_VALUES).optional(),
  energy: z.enum(NODE_ENERGY_VALUES).optional(),
  size: z.enum(NODE_SIZE_VALUES).optional(),
  icon: z.string().max(40).optional(),
  color: z.string().max(20).optional(),
  tags: z.array(z.string().max(50)).max(40).optional(),
  positionX: z.number(),
  positionY: z.number(),
  parentId: z.string().optional(),
  targetDate: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  financialData: z.unknown().optional(),
});

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
  const graph = await prisma.graph.findFirst({ where: { id: d.graphId, userId } });
  if (!graph) return NextResponse.json({ error: "GRAPH_NOT_FOUND" }, { status: 404 });

  let depth = 0;
  if (d.parentId) {
    const parent = await prisma.node.findFirst({
      where: { id: d.parentId, graphId: d.graphId, userId },
      select: { depth: true },
    });
    if (!parent) return NextResponse.json({ error: "PARENT_NOT_FOUND" }, { status: 404 });
    depth = (parent.depth ?? 0) + 1;
  }

  const node = await prisma.node.create({
    data: {
      graphId: d.graphId,
      userId,
      path: `/root/${d.graphId}/${crypto.randomUUID()}`,
      title: d.title,
      category: d.category,
      subCategory: d.subCategory ?? null,
      description: d.description ?? null,
      status: d.status ?? "FUTURE",
      priority: d.priority ?? "MEDIUM",
      timeHorizon: d.timeHorizon ?? "MONTH",
      energy: d.energy ?? "STEADY",
      size: d.size ?? "MD",
      icon: d.icon ?? null,
      color: d.color ?? null,
      tags: d.tags ?? [],
      positionX: d.positionX,
      positionY: d.positionY,
      parentId: d.parentId ?? null,
      depth,
      targetDate: d.targetDate ? new Date(d.targetDate) : null,
      startDate: d.startDate ? new Date(d.startDate) : null,
      financialData: (d.financialData as object | undefined) ?? undefined,
    },
  });

  return NextResponse.json({ node }, { status: 201 });
}
