import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

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
    const booking_id = body?.booking_id as string | undefined;
    const rating = Number(body?.rating);
    const comment = typeof body?.comment === "string" ? body.comment : null;

    if (!booking_id) {
      return NextResponse.json({ error: "booking_id required" }, { status: 400 });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "rating must be 1–5" }, { status: 400 });
    }

    const { data: booking, error: bErr } = await supabase
      .from("audit_bookings")
      .select("id, client_id, auditor_id, status")
      .eq("id", booking_id)
      .single();

    if (bErr || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.client_id !== user.id) {
      return NextResponse.json({ error: "Only the client can review" }, { status: 403 });
    }

    if (booking.status !== "completed") {
      return NextResponse.json({ error: "Booking must be completed before review" }, { status: 400 });
    }

    const { data: dupe } = await supabase
      .from("audit_reviews")
      .select("id")
      .eq("booking_id", booking_id)
      .maybeSingle();

    if (dupe) {
      return NextResponse.json({ error: "Review already submitted" }, { status: 400 });
    }

    const { error: insErr } = await supabase.from("audit_reviews").insert({
      booking_id,
      reviewer_id: user.id,
      auditor_id: booking.auditor_id,
      rating,
      comment: comment?.trim() || null,
    });

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
