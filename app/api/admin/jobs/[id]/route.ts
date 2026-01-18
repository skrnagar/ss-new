import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase-admin";
import { logAdminActivity } from "@/lib/admin-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const jobId = params.id;

    const { data: job, error } = await supabase
      .from("jobs")
      .select(
        `
        *,
        company:companies(id, name, logo_url, description),
        applications:job_applications(
          id,
          user_id,
          status,
          applied_at,
          user:profiles(id, full_name, username, avatar_url, email)
        )
      `
      )
      .eq("id", jobId)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ job });
  } catch (error: any) {
    console.error("Error fetching job details:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching job details" },
      { status: 500 }
    );
  }
}

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

