import { NextRequest, NextResponse } from "next/server";
import { deleteAdminSession, getCurrentAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    
    if (admin) {
      await logAdminActivity(admin.id, "logout");
    }

    await deleteAdminSession();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "An error occurred during logout" },
      { status: 500 }
    );
  }
}

