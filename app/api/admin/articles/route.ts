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

    const { data: articles, error } = await supabase
      .from("articles")
      .select(
        `
        *,
        author:profiles(id, full_name, username)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ articles: articles || [] });
  } catch (error: any) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching articles" },
      { status: 500 }
    );
  }
}

