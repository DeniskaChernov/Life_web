import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generatePasswordResetToken, PASSWORD_RESET_TOKEN_TTL_MS } from "@/lib/password-reset";
import { sendEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

function getBaseUrl(req: Request): string {
  const env = process.env.NEXTAUTH_URL?.replace(/\/$/, "");
  if (env) return env;
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

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

  const { email } = parsed.data;

  // We always answer "ok" to avoid email enumeration.
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    // Either no user, or Google-only account — silently no-op.
    return NextResponse.json({ ok: true });
  }

  const { raw, hash } = generatePasswordResetToken();
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash: hash, expiresAt },
  });

  const base = getBaseUrl(req);
  const resetUrl = `${base}/reset-password?token=${raw}`;
  const subject = "LIFE — восстановление пароля";
  const text = [
    "Вы запросили сброс пароля для аккаунта LIFE.",
    "",
    `Ссылка для сброса (действует 1 час):`,
    resetUrl,
    "",
    "Если это были не вы — просто проигнорируйте это письмо.",
  ].join("\n");
  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#0F172A">
      <h2 style="margin:0 0 12px">Восстановление пароля</h2>
      <p>Перейдите по ссылке ниже, чтобы задать новый пароль (ссылка действует 1 час):</p>
      <p><a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#6366F1;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Сбросить пароль</a></p>
      <p style="color:#64748B;font-size:13px">Если это были не вы — проигнорируйте письмо.</p>
    </div>
  `;

  await sendEmail({ to: email, subject, html, text });

  return NextResponse.json({ ok: true });
}
