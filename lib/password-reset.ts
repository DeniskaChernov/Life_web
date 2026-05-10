import { randomBytes, createHash } from "crypto";

/** Returns a 64-char hex token (cryptographically random) and its SHA-256 hash. */
export function generatePasswordResetToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("hex");
  const hash = createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
}

export function hashPasswordResetToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Token is valid for 1 hour. */
export const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
