import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { SCENARIO_TYPE_VALUES } from "@/types/scenario.types";

const createSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  type: z.enum(SCENARIO_TYPE_VALUES).optional(),
  parameters: z.record(z.string(), z.unknown()),
  color: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const scenarios = await prisma.scenario.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ scenarios });
}

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

  const scenario = await prisma.scenario.create({
    data: {
      userId,
      name: d.name,
      description: d.description ?? null,
      type: d.type ?? "CUSTOM",
      parameters: d.parameters as Prisma.InputJsonValue,
      color: d.color ?? null,
      isActive: d.isActive ?? false,
    },
  });

  return NextResponse.json({ scenario }, { status: 201 });
}
