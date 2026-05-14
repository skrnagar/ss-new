import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin, logAdminActivity } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

/** Admin-only: set profiles.verified for identity / professional badge. */
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
    const verified = Boolean(body?.verified);

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("profiles")
      .update({ verified })
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAdminActivity(
      admin.id,
      verified ? "verify_profile" : "unverify_profile",
      "profile",
      params.id
    );

    return NextResponse.json({ ok: true, verified });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
