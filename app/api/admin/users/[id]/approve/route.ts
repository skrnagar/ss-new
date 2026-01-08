import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { getCurrentAdmin, logAdminActivity } from "@/lib/admin-auth";

// POST - Approve an admin user
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentAdmin = await getCurrentAdmin();
    
    if (!currentAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only super admins can approve users
    if (currentAdmin.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("admin_users")
      .update({ is_approved: true })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await logAdminActivity(
      currentAdmin.id,
      "approve_admin",
      "admin_user",
      params.id,
      { email: data.email }
    );

    return NextResponse.json({ success: true, adminUser: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

