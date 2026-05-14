import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/** Auditor requests platform verification (pending admin review). */
export async function POST(_request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("id, professional_role, auditor_verification_status")
      .eq("id", user.id)
      .single();

    if (pErr || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.professional_role !== "auditor") {
      return NextResponse.json({ error: "Only auditor profiles can request verification" }, { status: 400 });
    }

    if (profile.auditor_verification_status === "approved") {
      return NextResponse.json({ error: "Already verified" }, { status: 400 });
    }

    if (profile.auditor_verification_status === "pending") {
      return NextResponse.json({ ok: true, status: "pending", message: "Request already pending" });
    }

    const { error: uErr } = await supabase
      .from("profiles")
      .update({
        auditor_verification_status: "pending",
        auditor_verification_requested_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (uErr) {
      return NextResponse.json({ error: uErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, status: "pending" });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
