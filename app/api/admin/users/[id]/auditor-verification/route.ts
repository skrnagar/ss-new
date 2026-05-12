import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin, logAdminActivity } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type Status = "approved" | "rejected" | "none" | "pending";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const status = body?.status as Status;
    const notes = typeof body?.notes === "string" ? body.notes : null;

    if (!["approved", "rejected", "none", "pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const sb = createAdminClient();
    const { data: profile, error: gErr } = await sb
      .from("profiles")
      .select("id, professional_role")
      .eq("id", params.id)
      .single();

    if (gErr || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (profile.professional_role !== "auditor" && status !== "none") {
      return NextResponse.json(
        { error: "Profile is not marked as auditor; set role to auditor first" },
        { status: 400 }
      );
    }

    const { error: uErr } = await sb
      .from("profiles")
      .update({
        auditor_verification_status: status,
        auditor_verification_notes: notes,
        auditor_verification_reviewed_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    if (uErr) {
      return NextResponse.json({ error: uErr.message }, { status: 500 });
    }

    await logAdminActivity(admin.id, "auditor_verification", "profile", params.id, {
      status,
      notes,
    });

    return NextResponse.json({ ok: true, status });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
