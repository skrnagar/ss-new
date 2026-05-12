import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { jobMatchesAlert, type JobRow, type JobAlertRow } from "@/lib/job-alert-match";
import { notificationEmailHtml, sendEmailViaResend, siteBaseUrl } from "@/lib/email-resend";

export const dynamic = "force-dynamic";

/**
 * Called after a job is published. Creates `notifications` rows (type job_alert)
 * for matching job_alerts, and optionally sends email via Resend.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const jobId = body?.jobId as string | undefined;
    if (!jobId) {
      return NextResponse.json({ error: "jobId required" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: job, error: jobErr } = await admin
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobErr || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.posted_by !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const jobRow = job as unknown as JobRow;

    const { data: alerts, error: alertsErr } = await admin
      .from("job_alerts")
      .select("*")
      .eq("is_active", true);

    if (alertsErr) {
      console.error("job_alerts fetch:", alertsErr);
      return NextResponse.json({ error: alertsErr.message }, { status: 500 });
    }

    let notified = 0;
    let emailed = 0;

    for (const row of alerts || []) {
      const alert = row as unknown as JobAlertRow;
      if (alert.user_id === job.posted_by) continue;
      if (!jobMatchesAlert(jobRow, alert)) continue;

      const link = `/jobs/${job.id}`;
      const { data: dupe } = await admin
        .from("notifications")
        .select("id")
        .eq("user_id", alert.user_id)
        .eq("type", "job_alert")
        .eq("link", link)
        .maybeSingle();

      if (dupe) continue;

      const content = `New job match: ${job.title} at ${job.company_name}`;

      const { data: inserted, error: insErr } = await admin
        .from("notifications")
        .insert({
          user_id: alert.user_id,
          type: "job_alert",
          content,
          link,
        })
        .select("id")
        .single();

      if (insErr) {
        console.error("notification insert:", insErr);
        continue;
      }

      notified++;

      const { data: prefRow } = await admin
        .from("profiles")
        .select("email_job_alerts")
        .eq("id", alert.user_id)
        .maybeSingle();

      const emailAllowed =
        (prefRow as { email_job_alerts?: boolean } | null)?.email_job_alerts !== false;

      const { data: authData } = await admin.auth.admin.getUserById(alert.user_id);

      const email = authData?.user?.email;
      if (email && inserted?.id && emailAllowed) {
        const site = siteBaseUrl();
        const jobUrl = site ? `${site}${link}` : link;
        const sent = await sendEmailViaResend({
          to: email,
          subject: `Job alert: ${job.title}`,
          html: notificationEmailHtml({
            title: "New job match",
            body: content,
            ctaHref: jobUrl,
            ctaLabel: "View job",
          }),
        });

        if (sent.ok) {
          emailed++;
          await admin
            .from("notifications")
            .update({ email_sent_at: new Date().toISOString() })
            .eq("id", inserted.id);
        }
      }
    }

    return NextResponse.json({ ok: true, notified, emailed });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
