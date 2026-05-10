/**
 * Minimal mailer.
 * - If RESEND_API_KEY is set, sends via Resend (https://resend.com/).
 * - Otherwise, logs the message to stdout (visible in Railway logs) so the user
 *   can still copy the link manually during early development.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ delivered: boolean; via: "resend" | "log" }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "LIFE <noreply@life-web.app>";

  if (!apiKey) {
    console.log("[email:log] →", opts.to, "·", opts.subject);
    console.log(opts.text);
    return { delivered: false, via: "log" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      }),
    });
    if (!res.ok) {
      console.error("[email:resend] failed", res.status, await res.text());
      return { delivered: false, via: "resend" };
    }
    return { delivered: true, via: "resend" };
  } catch (e) {
    console.error("[email:resend] error", e);
    return { delivered: false, via: "resend" };
  }
}
