import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPasswordResetToken } from "@/lib/password-reset";

const schema = z.object({
  token: z.string().min(16),
  password: z.string().min(8).max(200),
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
    return NextResponse.json(
      { error: "VALIDATION", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { token, password } = parsed.data;
  const tokenHash = hashPasswordResetToken(token);

  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!record) return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 400 });
  if (record.usedAt) return NextResponse.json({ error: "TOKEN_USED" }, { status: 400 });
  if (record.expiresAt < new Date())
    return NextResponse.json({ error: "TOKEN_EXPIRED" }, { status: 400 });

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    // Invalidate all other tokens for this user.
    prisma.passwordResetToken.updateMany({
      where: { userId: record.userId, usedAt: null, id: { not: record.id } },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
