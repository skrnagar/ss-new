import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use admin client to bypass RLS
    const supabase = createAdminClient();

    const { data: activities, error } = await supabase
      .from("admin_activity_log")
      .select(
        `
        *,
        admin_user:admin_users(id, full_name, email)
      `
      )
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      throw error;
    }

    return NextResponse.json({ activities: activities || [] });
  } catch (error: any) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching activities" },
      { status: 500 }
    );
  }
}

