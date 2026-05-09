import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  graphId: z.string().min(1),
  sourceId: z.string().min(1),
  targetId: z.string().min(1),
  type: z.string().max(50).optional(),
  label: z.string().max(255).optional(),
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
    return NextResponse.json({ error: "VALIDATION", details: parsed.error.flatten() }, { status: 400 });
  }

  const { graphId, sourceId, targetId, type, label } = parsed.data;

  const graph = await prisma.graph.findFirst({ where: { id: graphId, userId } });
  if (!graph) return NextResponse.json({ error: "GRAPH_NOT_FOUND" }, { status: 404 });

  if (sourceId === targetId) {
    return NextResponse.json({ error: "SELF_EDGE" }, { status: 400 });
  }

  const [a, b] = await Promise.all([
    prisma.node.findFirst({ where: { id: sourceId, graphId, userId } }),
    prisma.node.findFirst({ where: { id: targetId, graphId, userId } }),
  ]);
  if (!a || !b) return NextResponse.json({ error: "NODE_NOT_FOUND" }, { status: 404 });

  const edgeType = type ?? "RELATED";

  try {
    const edge = await prisma.edge.create({
      data: {
        graphId,
        userId,
        sourceId,
        targetId,
        type: edgeType,
        label: label ?? null,
      },
    });
    return NextResponse.json({ edge }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "DUPLICATE_EDGE" }, { status: 409 });
  }
}
