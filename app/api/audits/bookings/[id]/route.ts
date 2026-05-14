import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type Action = "confirm" | "decline" | "start" | "complete" | "cancel";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const action = body?.action as Action;
    const allowed: Action[] = ["confirm", "decline", "start", "complete", "cancel"];
    if (!allowed.includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { data: booking, error: gErr } = await supabase
      .from("audit_bookings")
      .select("*")
      .eq("id", params.id)
      .single();

    if (gErr || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isClient = booking.client_id === user.id;
    const isAuditor = booking.auditor_id === user.id;
    if (!isClient && !isAuditor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let nextStatus: string | null = null;

    switch (action) {
      case "confirm":
        if (!isAuditor) return NextResponse.json({ error: "Only the auditor can confirm" }, { status: 403 });
        if (booking.status !== "requested") {
          return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
        }
        nextStatus = "confirmed";
        break;
      case "decline":
        if (!isAuditor) return NextResponse.json({ error: "Only the auditor can decline" }, { status: 403 });
        if (booking.status !== "requested") {
          return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
        }
        nextStatus = "declined";
        break;
      case "start":
        if (!isAuditor) return NextResponse.json({ error: "Only the auditor can start" }, { status: 403 });
        if (booking.status !== "confirmed") {
          return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
        }
        nextStatus = "in_progress";
        break;
      case "complete":
        if (!isAuditor) return NextResponse.json({ error: "Only the auditor can complete" }, { status: 403 });
        if (booking.status !== "in_progress") {
          return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
        }
        nextStatus = "completed";
        break;
      case "cancel":
        if (booking.status === "completed" || booking.status === "declined" || booking.status === "cancelled") {
          return NextResponse.json({ error: "Cannot cancel this booking" }, { status: 400 });
        }
        nextStatus = "cancelled";
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const { error: uErr } = await supabase
      .from("audit_bookings")
      .update({ status: nextStatus!, updated_at: new Date().toISOString() })
      .eq("id", params.id);

    if (uErr) {
      return NextResponse.json({ error: uErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, status: nextStatus });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
