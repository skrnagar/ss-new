import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient();

    const { data: jobs, error } = await supabase
      .from("jobs")
      .select(
        `
        *,
        company:companies(id, name, logo_url)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ jobs: jobs || [] });
  } catch (error: any) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching jobs" },
      { status: 500 }
    );
  }
}

