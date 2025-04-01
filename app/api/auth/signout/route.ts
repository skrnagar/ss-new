
import { createLegacyClient } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = cookies();
  const supabase = createLegacyClient();
  
  // Sign out on the server
  await supabase.auth.signOut();
  
  // Clear the auth cookie
  cookieStore.delete('sb-access-token');
  cookieStore.delete('sb-refresh-token');

  return NextResponse.json({ success: true }, { status: 200 });
}
