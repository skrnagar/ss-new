import { createLegacyClient } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = createLegacyClient();
  await supabase.auth.signOut();

  return NextResponse.json({ success: true }, { status: 200 });
}
