import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("audit_bookings")
      .select("*")
      .or(`client_id.eq.${user.id},auditor_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bookings: data || [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

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
    const auditorUsername = body?.auditorUsername as string | undefined;
    const scheduled_start = body?.scheduled_start as string | null | undefined;
    const scheduled_end = body?.scheduled_end as string | null | undefined;
    const site_address = body?.site_address as string | null | undefined;
    const site_notes = body?.site_notes as string | null | undefined;
    const scope_summary = body?.scope_summary as string | null | undefined;

    if (!auditorUsername?.trim()) {
      return NextResponse.json({ error: "auditorUsername required" }, { status: 400 });
    }

    const { data: auditor, error: aErr } = await supabase
      .from("profiles")
      .select("id, professional_role, auditor_verification_status, is_profile_public, auditor_visible")
      .ilike("username", auditorUsername.trim())
      .maybeSingle();

    if (aErr || !auditor) {
      return NextResponse.json({ error: "Auditor not found" }, { status: 404 });
    }

    if (auditor.id === user.id) {
      return NextResponse.json({ error: "Cannot book yourself" }, { status: 400 });
    }

    if (auditor.professional_role !== "auditor") {
      return NextResponse.json({ error: "User is not an auditor" }, { status: 400 });
    }

    if (auditor.auditor_verification_status !== "approved") {
      return NextResponse.json(
        { error: "This auditor is not verified for bookings yet" },
        { status: 400 }
      );
    }

    if (auditor.is_profile_public === false || auditor.auditor_visible === false) {
      return NextResponse.json({ error: "Auditor not accepting bookings" }, { status: 400 });
    }

    const { data: row, error: insErr } = await supabase
      .from("audit_bookings")
      .insert({
        client_id: user.id,
        auditor_id: auditor.id,
        status: "requested",
        scheduled_start: scheduled_start || null,
        scheduled_end: scheduled_end || null,
        site_address: site_address || null,
        site_notes: site_notes || null,
        scope_summary: scope_summary || null,
      })
      .select("id")
      .single();

    if (insErr || !row) {
      return NextResponse.json({ error: insErr?.message || "Insert failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: row.id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
