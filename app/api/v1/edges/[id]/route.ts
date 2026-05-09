import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
