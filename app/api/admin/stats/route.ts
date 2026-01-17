import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get time range from query params
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get("range") || "7d";
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;

    // Use admin client to bypass RLS
    const supabase = createAdminClient();

    // Fetch all stats in parallel
    const [
      usersResult,
      postsResult,
      jobsResult,
      companiesResult,
      articlesResult,
      messagesResult,
      eventsResult,
      activityResult,
    ] = await Promise.all([
      supabase.from("profiles").select("id, created_at", { count: "exact" }),
      supabase.from("posts").select("id, created_at", { count: "exact" }),
      supabase.from("jobs").select("id", { count: "exact", head: true }),
      supabase.from("companies").select("id", { count: "exact", head: true }),
      supabase.from("articles").select("id", { count: "exact", head: true }),
      supabase.from("messages").select("id", { count: "exact", head: true }),
      supabase.from("events").select("id", { count: "exact", head: true }),
      supabase
        .from("admin_activity_log")
        .select("*, admin_user:admin_users(id, full_name, email)")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    // Get user growth data for selected period
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - days);
    const previousPeriodStart = new Date(periodStart);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days);

    const { data: recentUsers } = await supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", periodStart.toISOString());

    const { data: previousUsers } = await supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", previousPeriodStart.toISOString())
      .lt("created_at", periodStart.toISOString());

    // Get active users today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { data: activeUsersTodayData } = await supabase
      .from("profiles")
      .select("id")
      .gte("last_seen", todayStart.toISOString())
      .limit(1000);

    // Get post activity data
    const { data: recentPosts } = await supabase
      .from("posts")
      .select("created_at")
      .gte("created_at", periodStart.toISOString());

    const { data: previousPosts } = await supabase
      .from("posts")
      .select("created_at")
      .gte("created_at", previousPeriodStart.toISOString())
      .lt("created_at", periodStart.toISOString());

    // Calculate growth percentages
    const recentUserCount = recentUsers?.length || 0;
    const previousUserCount = previousUsers?.length || 0;
    const userGrowthPercentage = previousUserCount > 0
      ? ((recentUserCount - previousUserCount) / previousUserCount) * 100
      : recentUserCount > 0 ? 100 : 0;

    const recentPostCount = recentPosts?.length || 0;
    const previousPostCount = previousPosts?.length || 0;
    const postGrowthPercentage = previousPostCount > 0
      ? ((recentPostCount - previousPostCount) / previousPostCount) * 100
      : recentPostCount > 0 ? 100 : 0;

    // Process user growth data by day
    const userGrowthMap = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
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
      fullDate: date,
    }));

    // Process post activity data by day
    const postActivityMap = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
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
      fullDate: date,
    }));

    // Get pending admin approvals (if super admin)
    let pendingApprovals = 0;
    if (admin.role === "super_admin") {
      const { count } = await supabase
        .from("admin_users")
        .select("id", { count: "exact", head: true })
        .eq("is_approved", false)
        .eq("is_active", true);
      pendingApprovals = count || 0;
    }

    return NextResponse.json({
      totalUsers: usersResult.count || 0,
      totalPosts: postsResult.count || 0,
      totalJobs: jobsResult.count || 0,
      totalCompanies: companiesResult.count || 0,
      totalArticles: articlesResult.count || 0,
      totalMessages: messagesResult.count || 0,
      totalEvents: eventsResult.count || 0,
      activeUsersToday: activeUsersTodayData?.length || 0,
      recentActivity: activityResult.data || [],
      userGrowth,
      postActivity,
      userGrowthPercentage: Number(userGrowthPercentage.toFixed(2)),
      postGrowthPercentage: Number(postGrowthPercentage.toFixed(2)),
      pendingApprovals,
    });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching stats" },
      { status: 500 }
    );
  }
}
