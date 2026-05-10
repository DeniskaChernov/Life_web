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

const patchSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).nullable().optional(),
  category: z.enum(NODE_CATEGORY_VALUES).optional(),
  subCategory: z.string().max(100).nullable().optional(),
  status: z.enum(NODE_STATUS_VALUES).optional(),
  priority: z.enum(NODE_PRIORITY_VALUES).optional(),
  timeHorizon: z.enum(TIME_HORIZON_VALUES).optional(),
  energy: z.enum(NODE_ENERGY_VALUES).optional(),
  size: z.enum(NODE_SIZE_VALUES).optional(),
  icon: z.string().max(40).nullable().optional(),
  color: z.string().max(20).nullable().optional(),
  tags: z.array(z.string().max(50)).max(40).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  isPinned: z.boolean().optional(),
  isCollapsed: z.boolean().optional(),
  targetDate: z.string().datetime().nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  financialData: z.unknown().optional(),
  parentId: z.string().nullable().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.node.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const d = parsed.data;

  const completedAt =
    d.status === "COMPLETED" && existing.status !== "COMPLETED"
      ? new Date()
      : d.status && d.status !== "COMPLETED" && existing.status === "COMPLETED"
        ? null
        : undefined;

  const progressOverride =
    d.status === "COMPLETED" && existing.status !== "COMPLETED" && d.progress === undefined
      ? 100
      : undefined;

  const node = await prisma.node.update({
    where: { id },
    data: {
      ...(d.title !== undefined && { title: d.title }),
      ...(d.description !== undefined && { description: d.description }),
      ...(d.category !== undefined && { category: d.category }),
      ...(d.subCategory !== undefined && { subCategory: d.subCategory }),
      ...(d.status !== undefined && { status: d.status }),
      ...(d.priority !== undefined && { priority: d.priority }),
      ...(d.timeHorizon !== undefined && { timeHorizon: d.timeHorizon }),
      ...(d.energy !== undefined && { energy: d.energy }),
      ...(d.size !== undefined && { size: d.size }),
      ...(d.icon !== undefined && { icon: d.icon }),
      ...(d.color !== undefined && { color: d.color }),
      ...(d.tags !== undefined && { tags: d.tags }),
      ...(progressOverride !== undefined
        ? { progress: progressOverride }
        : d.progress !== undefined
          ? { progress: d.progress }
          : {}),
      ...(d.isPinned !== undefined && { isPinned: d.isPinned }),
      ...(d.isCollapsed !== undefined && { isCollapsed: d.isCollapsed }),
      ...(d.targetDate !== undefined && {
        targetDate: d.targetDate === null ? null : new Date(d.targetDate),
      }),
      ...(d.startDate !== undefined && {
        startDate: d.startDate === null ? null : new Date(d.startDate),
      }),
      ...(completedAt !== undefined && { completedAt }),
      ...(d.positionX !== undefined && { positionX: d.positionX }),
      ...(d.positionY !== undefined && { positionY: d.positionY }),
      ...(d.parentId !== undefined && { parentId: d.parentId }),
      ...(d.financialData !== undefined && {
        financialData: d.financialData as object | null,
      }),
      version: { increment: 1 },
    },
  });

  return NextResponse.json({ node });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.node.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  await prisma.node.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
