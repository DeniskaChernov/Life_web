import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  timezone: z.string().max(50).optional(),
  currency: z.string().max(10).optional(),
  onboardingCompleted: z.boolean().optional(),
  settings: z.unknown().optional(),
});

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      timezone: true,
      currency: true,
      onboardingCompleted: true,
      settings: true,
      createdAt: true,
    },
  });

  if (!user) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

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

  const { settings, ...rest } = parsed.data;
  const updateData: Prisma.UserUpdateInput = {
    ...rest,
    ...(settings !== undefined ? { settings: settings as Prisma.InputJsonValue } : {}),
  };

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      timezone: true,
      currency: true,
      onboardingCompleted: true,
    },
  });

  return NextResponse.json({ user });
}
