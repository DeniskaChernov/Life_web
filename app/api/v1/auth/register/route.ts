import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().max(255).optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "VALIDATION", details: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password, name } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "EMAIL_TAKEN" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        name: name ?? null,
      },
    });

    const graph = await tx.graph.create({
      data: {
        userId: user.id,
        name: "Мой LIFE Map",
        description: "Корневой граф стратегии",
        isRoot: true,
      },
    });

    const n1 = await tx.node.create({
      data: {
        graphId: graph.id,
        userId: user.id,
        path: `/root/${graph.id}/goal-1`,
        title: "Финансовая независимость",
        category: "GOAL",
        status: "ACTIVE",
        positionX: 120,
        positionY: 80,
        color: "#6366F1",
        tags: [],
      },
    });

    const n2 = await tx.node.create({
      data: {
        graphId: graph.id,
        userId: user.id,
        path: `/root/${graph.id}/asset-1`,
        title: "Накопления",
        category: "ASSET",
        status: "FUTURE",
        positionX: 420,
        positionY: 200,
        color: "#10B981",
        tags: [],
      },
    });

    await tx.edge.create({
      data: {
        graphId: graph.id,
        userId: user.id,
        sourceId: n1.id,
        targetId: n2.id,
        type: "RELATED",
        label: "питает",
      },
    });
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
