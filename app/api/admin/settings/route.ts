import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase-admin";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

// PATCH - Update admin profile
export async function PATCH(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { full_name } = body;

    if (!full_name) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("admin_users")
      .update({ full_name })
      .eq("id", admin.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      admin: data,
      message: "Profile updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating admin profile:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while updating profile" },
      { status: 500 }
    );
  }
}

// PUT - Update admin password
export async function PUT(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Get current admin to verify password
    const { data: adminData, error: fetchError } = await supabase
      .from("admin_users")
      .select("password_hash")
      .eq("id", admin.id)
      .single();

    if (fetchError || !adminData) {
      return NextResponse.json(
        { error: "Failed to verify current password" },
        { status: 500 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      adminData.password_hash
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const { error: updateError } = await supabase
      .from("admin_users")
      .update({ password_hash: hashedPassword })
      .eq("id", admin.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating admin password:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while updating password" },
      { status: 500 }
    );
  }
}

