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
    const range = searchParams.get("range") || "30d";
    const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;

    const supabase = createAdminClient();
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - days);

    // Fetch comprehensive analytics in parallel
    const [
      totalLikesResult,
      totalCommentsResult,
      topPostsResult,
      topUsersResult,
      engagementByDay,
      contentByType,
      jobsResult,
      articlesResult,
      eventsResult,
      connectionsResult,
      messagesResult,
    ] = await Promise.all([
      // Total likes
      supabase.from("likes").select("id, created_at, post_id", { count: "exact" }),
      
      // Total comments
      supabase.from("comments").select("id, created_at, post_id, user_id", { count: "exact" }),
      
      // Top posts by engagement
      supabase.from("posts").select("id, content, created_at, user_id, likes_count, comments_count").order("created_at", { ascending: false }).limit(10),
      
      // Top active users
      supabase.from("profiles").select("id, full_name, username, avatar_url, created_at").order("created_at", { ascending: false }).limit(10),
      
      // Engagement by day
      supabase.from("likes").select("created_at").gte("created_at", periodStart.toISOString()),
      
      // Content breakdown
      supabase.from("posts").select("id, created_at", { count: "exact" }),
      
      // Jobs data
      supabase.from("jobs").select("id, title, created_at, views_count, applications_count").order("created_at", { ascending: false }).limit(10),
      
      // Articles data
      supabase.from("articles").select("id, title, created_at, views, published_at").order("created_at", { ascending: false }).limit(10),
      
      // Events data
      supabase.from("events").select("id, title, start_date, created_at").order("created_at", { ascending: false }).limit(10),
      
      // Connections
      supabase.from("connections").select("id, created_at", { count: "exact" }),
      
      // Messages
      supabase.from("messages").select("id, created_at", { count: "exact" }),
    ]);

    // Calculate engagement metrics
    const totalLikes = totalLikesResult.count || 0;
    const totalComments = totalCommentsResult.count || 0;
    const totalPosts = contentByType.count || 0;
    const engagementRate = totalPosts > 0 ? ((totalLikes + totalComments) / totalPosts) : 0;

    // Process engagement by day
    const engagementMap = new Map<string, { likes: number; comments: number }>();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      engagementMap.set(dateStr, { likes: 0, comments: 0 });
    }

    engagementByDay.data?.forEach((like: any) => {
      const dateStr = like.created_at.split("T")[0];
      const current = engagementMap.get(dateStr) || { likes: 0, comments: 0 };
      engagementMap.set(dateStr, { ...current, likes: current.likes + 1 });
    });

    // Get comments by day
    const { data: commentsByDay } = await supabase
      .from("comments")
      .select("created_at")
      .gte("created_at", periodStart.toISOString());

    commentsByDay?.forEach((comment: any) => {
      const dateStr = comment.created_at.split("T")[0];
      const current = engagementMap.get(dateStr) || { likes: 0, comments: 0 };
      engagementMap.set(dateStr, { ...current, comments: current.comments + 1 });
    });

    const dailyEngagement = Array.from(engagementMap.entries()).map(([date, data]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      likes: data.likes,
      comments: data.comments,
      total: data.likes + data.comments,
      fullDate: date,
    }));

    // Calculate top performing posts
    const topPosts = topPostsResult.data?.map((post: any) => ({
      id: post.id,
      content: post.content?.substring(0, 100) || "",
      likes: post.likes_count || 0,
      comments: post.comments_count || 0,
      engagement: (post.likes_count || 0) + (post.comments_count || 0),
      created_at: post.created_at,
    })).sort((a, b) => b.engagement - a.engagement).slice(0, 5) || [];

    // Calculate user activity
    const { data: recentUsers } = await supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", periodStart.toISOString());

    const userActivityMap = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      userActivityMap.set(dateStr, 0);
    }

    recentUsers?.forEach((user: any) => {
      const dateStr = user.created_at.split("T")[0];
      const count = userActivityMap.get(dateStr) || 0;
      userActivityMap.set(dateStr, count + 1);
    });

    const userActivity = Array.from(userActivityMap.entries()).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count,
      fullDate: date,
    }));

    // Content creation trends
    const { data: postsByDay } = await supabase
      .from("posts")
      .select("created_at")
      .gte("created_at", periodStart.toISOString());

    const contentMap = new Map<string, { posts: number; articles: number; jobs: number; events: number }>();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      contentMap.set(dateStr, { posts: 0, articles: 0, jobs: 0, events: 0 });
    }

    postsByDay?.forEach((post: any) => {
      const dateStr = post.created_at.split("T")[0];
      const current = contentMap.get(dateStr) || { posts: 0, articles: 0, jobs: 0, events: 0 };
      contentMap.set(dateStr, { ...current, posts: current.posts + 1 });
    });

    const { data: articlesByDay } = await supabase
      .from("articles")
      .select("created_at")
      .gte("created_at", periodStart.toISOString());

    articlesByDay?.forEach((article: any) => {
      const dateStr = article.created_at.split("T")[0];
      const current = contentMap.get(dateStr) || { posts: 0, articles: 0, jobs: 0, events: 0 };
      contentMap.set(dateStr, { ...current, articles: current.articles + 1 });
    });

    const { data: jobsByDay } = await supabase
      .from("jobs")
      .select("created_at")
      .gte("created_at", periodStart.toISOString());

    jobsByDay?.forEach((job: any) => {
      const dateStr = job.created_at.split("T")[0];
      const current = contentMap.get(dateStr) || { posts: 0, articles: 0, jobs: 0, events: 0 };
      contentMap.set(dateStr, { ...current, jobs: current.jobs + 1 });
    });

    const { data: eventsByDay } = await supabase
      .from("events")
      .select("created_at")
      .gte("created_at", periodStart.toISOString());

    eventsByDay?.forEach((event: any) => {
      const dateStr = event.created_at.split("T")[0];
      const current = contentMap.get(dateStr) || { posts: 0, articles: 0, jobs: 0, events: 0 };
      contentMap.set(dateStr, { ...current, events: current.events + 1 });
    });

    const contentTrends = Array.from(contentMap.entries()).map(([date, data]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      posts: data.posts,
      articles: data.articles,
      jobs: data.jobs,
      events: data.events,
      total: data.posts + data.articles + data.jobs + data.events,
      fullDate: date,
    }));

    // Get hourly activity pattern (for 24-hour breakdown)
    const { data: allActivity } = await supabase
      .from("posts")
      .select("created_at")
      .gte("created_at", periodStart.toISOString());

    const hourlyActivity = new Array(24).fill(0);
    allActivity?.forEach((item: any) => {
      const hour = new Date(item.created_at).getHours();
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    });

    const hourlyData = hourlyActivity.map((count, hour) => ({
      hour: `${hour}:00`,
      count,
    }));

    // Calculate averages
    const avgLikesPerPost = totalPosts > 0 ? (totalLikes / totalPosts) : 0;
    const avgCommentsPerPost = totalPosts > 0 ? (totalComments / totalPosts) : 0;
    const totalConnections = connectionsResult.count || 0;
    const totalMessages = messagesResult.count || 0;

    return NextResponse.json({
      // Summary metrics
      summary: {
        totalLikes,
        totalComments,
        totalPosts,
        totalConnections,
        totalMessages,
        engagementRate: Number(engagementRate.toFixed(2)),
        avgLikesPerPost: Number(avgLikesPerPost.toFixed(2)),
        avgCommentsPerPost: Number(avgCommentsPerPost.toFixed(2)),
      },
      
      // Time-based analytics
      dailyEngagement,
      userActivity,
      contentTrends,
      hourlyActivity: hourlyData,
      
      // Top performers
      topPosts,
      topUsers: topUsersResult.data || [],
      topJobs: jobsResult.data || [],
      topArticles: articlesResult.data || [],
      topEvents: eventsResult.data || [],
    });
  } catch (error: any) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching analytics", details: error.message },
      { status: 500 }
    );
  }
}

