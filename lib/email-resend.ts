/**
 * Optional transactional email via Resend HTTP API (no extra npm package).
 * Set RESEND_API_KEY and RESEND_FROM_EMAIL (e.g. "Safety Shaper <onboarding@resend.dev>").
 */

export function siteBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "";
}

/** Simple branded wrapper for notification-style emails. */
export function notificationEmailHtml(options: {
  title: string;
  body: string;
  ctaHref?: string;
  ctaLabel?: string;
}): string {
  const { title, body, ctaHref, ctaLabel } = options;
  const ctaBlock =
    ctaHref && ctaLabel
      ? `<p style="margin:24px 0"><a href="${ctaHref}" style="background:#1e40af;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">${ctaLabel}</a></p>`
      : "";
  return `<!doctype html><html><body style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">
<h1 style="font-size:20px">${title}</h1>
<p style="line-height:1.5">${body}</p>
${ctaBlock}
<p style="font-size:12px;color:#64748b;margin-top:32px">Safety Shaper — ESG &amp; EHS network</p>
</body></html>`;
}

export async function sendEmailViaResend(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM;
  if (!apiKey || !from) {
    return { ok: false, error: "missing_resend_env" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, error: text || res.statusText };
  }
  return { ok: true };
}
