import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { NODE_CATEGORY_VALUES } from "@/constants/node-categories";

const createSchema = z.object({
  graphId: z.string().min(1),
  title: z.string().min(1).max(500),
  category: z.enum(NODE_CATEGORY_VALUES),
  description: z.string().max(5000).optional(),
  positionX: z.number(),
  positionY: z.number(),
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

  const { graphId, title, category, description, positionX, positionY } = parsed.data;

  const graph = await prisma.graph.findFirst({ where: { id: graphId, userId } });
  if (!graph) return NextResponse.json({ error: "GRAPH_NOT_FOUND" }, { status: 404 });

  const node = await prisma.node.create({
    data: {
      graphId,
      userId,
      path: `/root/${graphId}/${crypto.randomUUID()}`,
      title,
      category,
      description: description ?? null,
      positionX,
      positionY,
      tags: [],
    },
  });

  return NextResponse.json({ node }, { status: 201 });
}
