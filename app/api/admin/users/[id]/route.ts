import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase-server";
import { logAdminActivity } from "@/lib/admin-auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient();
    const userId = params.id;

    // Delete user profile
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      throw profileError;
    }

    // Log activity
    await logAdminActivity(admin.id, "delete_user", "user", userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting user" },
      { status: 500 }
    );
  }
}

