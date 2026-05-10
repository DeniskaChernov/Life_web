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

const createSchema = z.object({
  graphId: z.string().min(1),
  sourceId: z.string().min(1),
  targetId: z.string().min(1),
  type: z.enum(EDGE_TYPE_VALUES).optional(),
  label: z.string().max(255).optional(),
  description: z.string().max(2000).optional(),
  strength: z.number().min(0).max(1).optional(),
  direction: z.enum(EDGE_DIRECTION_VALUES).optional(),
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

  const { graphId, sourceId, targetId, type, label, description, strength, direction } =
    parsed.data;

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

  const edgeType: EdgeType = (type ?? "RELATED") as EdgeType;
  const animated = ANIMATED_EDGE_TYPES.has(edgeType);

  try {
    const edge = await prisma.edge.create({
      data: {
        graphId,
        userId,
        sourceId,
        targetId,
        type: edgeType,
        label: label ?? null,
        description: description ?? null,
        strength: strength ?? 0.5,
        direction: direction ?? "FORWARD",
        isAnimated: animated,
      },
    });
    return NextResponse.json({ edge }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "DUPLICATE_EDGE" }, { status: 409 });
  }
}
