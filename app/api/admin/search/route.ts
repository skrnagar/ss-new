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

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const supabase = createAdminClient();
    const searchTerm = `%${query}%`;

    // Search across multiple tables
    const [
      usersResult,
      postsResult,
      jobsResult,
      companiesResult,
      articlesResult,
    ] = await Promise.all([
      // Search users
      supabase
        .from("profiles")
        .select("id, full_name, username, email, avatar_url")
        .or(`full_name.ilike.${searchTerm},username.ilike.${searchTerm},email.ilike.${searchTerm}`)
        .limit(5),
      
      // Search posts
      supabase
        .from("posts")
        .select("id, content, created_at, user_id")
        .ilike("content", searchTerm)
        .limit(5),
      
      // Search jobs
      supabase
        .from("jobs")
        .select("id, title, company_name, location")
        .or(`title.ilike.${searchTerm},company_name.ilike.${searchTerm}`)
        .limit(5),
      
      // Search companies
      supabase
        .from("companies")
        .select("id, name, description")
        .ilike("name", searchTerm)
        .limit(5),
      
      // Search articles
      supabase
        .from("articles")
        .select("id, title, slug")
        .or(`title.ilike.${searchTerm},slug.ilike.${searchTerm}`)
        .limit(5),
    ]);

    const results = {
      users: usersResult.data || [],
      posts: postsResult.data || [],
      jobs: jobsResult.data || [],
      companies: companiesResult.data || [],
      articles: articlesResult.data || [],
    };

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Error performing search:", error);
    return NextResponse.json(
      { error: "An error occurred while searching" },
      { status: 500 }
    );
  }
}

