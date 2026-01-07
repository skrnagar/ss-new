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

    // Fetch all stats in parallel
    const [
      usersResult,
      postsResult,
      jobsResult,
      companiesResult,
      articlesResult,
      messagesResult,
      activityResult,
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("posts").select("id", { count: "exact", head: true }),
      supabase.from("jobs").select("id", { count: "exact", head: true }),
      supabase.from("companies").select("id", { count: "exact", head: true }),
      supabase.from("articles").select("id", { count: "exact", head: true }),
      supabase.from("messages").select("id", { count: "exact", head: true }),
      supabase
        .from("admin_activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    // Get user growth data (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentUsers } = await supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", sevenDaysAgo.toISOString());

    // Get post activity data (last 7 days)
    const { data: recentPosts } = await supabase
      .from("posts")
      .select("created_at")
      .gte("created_at", sevenDaysAgo.toISOString());

    // Process user growth data
    const userGrowthMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      userGrowthMap.set(dateStr, 0);
    }

    recentUsers?.forEach((user) => {
      const dateStr = user.created_at.split("T")[0];
      const count = userGrowthMap.get(dateStr) || 0;
      userGrowthMap.set(dateStr, count + 1);
    });

    const userGrowth = Array.from(userGrowthMap.entries()).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count,
    }));

    // Process post activity data
    const postActivityMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      postActivityMap.set(dateStr, 0);
    }

    recentPosts?.forEach((post) => {
      const dateStr = post.created_at.split("T")[0];
      const count = postActivityMap.get(dateStr) || 0;
      postActivityMap.set(dateStr, count + 1);
    });

    const postActivity = Array.from(postActivityMap.entries()).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count,
    }));

    return NextResponse.json({
      totalUsers: usersResult.count || 0,
      totalPosts: postsResult.count || 0,
      totalJobs: jobsResult.count || 0,
      totalCompanies: companiesResult.count || 0,
      totalArticles: articlesResult.count || 0,
      totalMessages: messagesResult.count || 0,
      recentActivity: activityResult.data || [],
      userGrowth,
      postActivity,
    });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching stats" },
      { status: 500 }
    );
  }
}

