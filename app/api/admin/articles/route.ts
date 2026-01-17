import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use admin client to bypass RLS
    const supabase = createAdminClient();

    // First, fetch articles without join to avoid issues
    const { data: articles, error: articlesError } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (articlesError) {
      console.error("Error fetching articles:", articlesError);
      throw articlesError;
    }

    // If no articles, return empty array
    if (!articles || articles.length === 0) {
      return NextResponse.json({ articles: [] });
    }

    // Get all unique author IDs
    const authorIds = [...new Set(articles.map((a: any) => a.author_id).filter(Boolean))];

    // Fetch author profiles separately
    let profilesMap = new Map();
    if (authorIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url")
        .in("id", authorIds);

      if (profiles) {
        profilesMap = new Map(profiles.map((p: any) => [p.id, p]));
      }
    }

    // Combine articles with author data
    const articlesWithAuthors = articles.map((article: any) => ({
      ...article,
      author: profilesMap.get(article.author_id) || {
        id: article.author_id,
        full_name: "Unknown",
        username: "unknown",
      },
    }));

    return NextResponse.json({ articles: articlesWithAuthors || [] });
  } catch (error: any) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching articles", details: error.message },
      { status: 500 }
    );
  }
}
