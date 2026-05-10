import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  EDGE_TYPE_VALUES,
  EDGE_DIRECTION_VALUES,
  ANIMATED_EDGE_TYPES,
  type EdgeType,
} from "@/constants/edge-types";

const patchSchema = z.object({
  type: z.enum(EDGE_TYPE_VALUES).optional(),
  label: z.string().max(255).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  strength: z.number().min(0).max(1).optional(),
  direction: z.enum(EDGE_DIRECTION_VALUES).optional(),
  isAnimated: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.edge.findFirst({ where: { id, userId } });
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
  const animatedOverride =
    d.type !== undefined && d.isAnimated === undefined
      ? ANIMATED_EDGE_TYPES.has(d.type as EdgeType)
      : undefined;

  const edge = await prisma.edge.update({
    where: { id },
    data: {
      ...(d.type !== undefined && { type: d.type }),
      ...(d.label !== undefined && { label: d.label }),
      ...(d.description !== undefined && { description: d.description }),
      ...(d.strength !== undefined && { strength: d.strength }),
      ...(d.direction !== undefined && { direction: d.direction }),
      ...(d.isAnimated !== undefined
        ? { isAnimated: d.isAnimated }
        : animatedOverride !== undefined
          ? { isAnimated: animatedOverride }
          : {}),
    },
  });

  return NextResponse.json({ edge });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;

  const edge = await prisma.edge.findFirst({ where: { id, userId } });
  if (!edge) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  await prisma.edge.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
