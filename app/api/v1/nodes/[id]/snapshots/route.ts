import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;

  const node = await prisma.node.findFirst({ where: { id, userId }, select: { id: true } });
  if (!node) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const snapshots = await prisma.nodeSnapshot.findMany({
    where: { nodeId: id, userId },
    orderBy: { version: "desc" },
    take: 20,
    select: {
      id: true,
      version: true,
      reason: true,
      createdAt: true,
      snapshot: true,
    },
  });

  return NextResponse.json({ snapshots });
}
