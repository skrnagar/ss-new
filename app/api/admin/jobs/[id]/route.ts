import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase-admin";
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

    // Use admin client to bypass RLS
    const supabase = createAdminClient();
    const jobId = params.id;

    const { error } = await supabase.from("jobs").delete().eq("id", jobId);

    if (error) {
      throw error;
    }

    await logAdminActivity(admin.id, "delete_job", "job", jobId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting job" },
      { status: 500 }
    );
  }
}

