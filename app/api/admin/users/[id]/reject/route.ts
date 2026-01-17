import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { getCurrentAdmin, logAdminActivity } from "@/lib/admin-auth";

// POST - Reject/Delete an admin user
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentAdmin = await getCurrentAdmin();
    
    if (!currentAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only super admins can reject users
    if (currentAdmin.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get user info before deletion
    const supabase = createAdminClient();
    const { data: userToDelete } = await supabase
      .from("admin_users")
      .select("email")
      .eq("id", params.id)
      .single();

    const { error } = await supabase
      .from("admin_users")
      .delete()
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await logAdminActivity(
      currentAdmin.id,
      "reject_admin",
      "admin_user",
      params.id,
      { email: userToDelete?.email }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

