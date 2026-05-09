import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).nullable().optional(),
  status: z.string().max(50).optional(),
  priority: z.string().max(50).optional(),
  targetDate: z.string().datetime().nullable().optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
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
    return NextResponse.json({ error: "VALIDATION", details: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;
  const node = await prisma.node.update({
    where: { id },
    data: {
      ...(d.title !== undefined && { title: d.title }),
      ...(d.description !== undefined && { description: d.description }),
      ...(d.status !== undefined && { status: d.status }),
      ...(d.priority !== undefined && { priority: d.priority }),
      ...(d.targetDate !== undefined && {
        targetDate: d.targetDate === null ? null : new Date(d.targetDate),
      }),
      ...(d.positionX !== undefined && { positionX: d.positionX }),
      ...(d.positionY !== undefined && { positionY: d.positionY }),
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
