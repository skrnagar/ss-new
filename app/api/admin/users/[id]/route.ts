import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase-admin";
import { logAdminActivity } from "@/lib/admin-auth";

export const dynamic = 'force-dynamic';

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
    const userId = params.id;

    // Fetch comprehensive user data in parallel
    const [
      profileResult,
      postsResult,
      commentsResult,
      likesResult,
      connectionsResult,
      messagesResult,
      jobsResult,
      articlesResult,
      eventsResult,
      followsResult,
      companyFollowersResult,
    ] = await Promise.all([
      // User profile
      supabase.from("profiles").select("*").eq("id", userId).single(),
      
      // User posts
      supabase.from("posts").select("id, content, created_at, likes_count, comments_count").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
      
      // User comments
      supabase.from("comments").select("id, content, created_at, post_id").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
      
      // User likes
      supabase.from("likes").select("id, created_at, post_id").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
      
      // Connections
      supabase.from("connections").select("id, created_at, connected_user_id").or(`user_id.eq.${userId},connected_user_id.eq.${userId}`),
      
      // Messages sent/received
      supabase.from("messages").select("id, content, created_at, sender_id, receiver_id").or(`sender_id.eq.${userId},receiver_id.eq.${userId}`).order("created_at", { ascending: false }).limit(20),
      
      // Job applications
      supabase.from("job_applications").select("id, status, applied_at, job_id").eq("user_id", userId).order("applied_at", { ascending: false }).limit(20),
      
      // Articles authored
      supabase.from("articles").select("id, title, created_at, published_at, views").eq("author_id", userId).order("created_at", { ascending: false }).limit(20),
      
      // Events created
      supabase.from("events").select("id, title, start_date, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
      
      // Follows (following/followers)
      supabase.from("follows").select("id, created_at, follower_id, following_id").or(`follower_id.eq.${userId},following_id.eq.${userId}`),
      
      // Company followers
      supabase.from("company_followers").select("id, created_at, company_id").eq("user_id", userId),
    ]);

    // Get counts
    const [
      postsCount,
      commentsCount,
      likesCount,
      connectionsCount,
      messagesCount,
      jobsCount,
      articlesCount,
      eventsCount,
      followingCount,
      followersCount,
    ] = await Promise.all([
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("comments").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("likes").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("connections").select("id", { count: "exact", head: true }).or(`user_id.eq.${userId},connected_user_id.eq.${userId}`),
      supabase.from("messages").select("id", { count: "exact", head: true }).or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
      supabase.from("job_applications").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("articles").select("id", { count: "exact", head: true }).eq("author_id", userId),
      supabase.from("events").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", userId),
      supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", userId),
    ]);

    const profile = profileResult.data;
    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate engagement metrics
    const totalEngagement = (postsCount.count || 0) + (commentsCount.count || 0) + (likesCount.count || 0);
    const engagementRate = (postsCount.count || 0) > 0 
      ? (((commentsCount.count || 0) + (likesCount.count || 0)) / (postsCount.count || 0)).toFixed(2)
      : "0";

    return NextResponse.json({
      profile,
      stats: {
        posts: postsCount.count || 0,
        comments: commentsCount.count || 0,
        likes: likesCount.count || 0,
        connections: connectionsCount.count || 0,
        messages: messagesCount.count || 0,
        jobApplications: jobsCount.count || 0,
        articles: articlesCount.count || 0,
        events: eventsCount.count || 0,
        following: followingCount.count || 0,
        followers: followersCount.count || 0,
        totalEngagement,
        engagementRate: Number(engagementRate),
      },
      activity: {
        posts: postsResult.data || [],
        comments: commentsResult.data || [],
        likes: likesResult.data || [],
        connections: connectionsResult.data || [],
        messages: messagesResult.data || [],
        jobApplications: jobsResult.data || [],
        articles: articlesResult.data || [],
        events: eventsResult.data || [],
        follows: followsResult.data || [],
        companyFollowers: companyFollowersResult.data || [],
      },
    });
  } catch (error: any) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching user details", details: error.message },
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
    const userId = params.id;

    // First, delete all related data in the correct order
    // This prevents foreign key constraint violations

    // 1. Delete likes (references posts)
    await supabase.from("likes").delete().eq("user_id", userId);
    
    // 2. Delete comments (references posts and user)
    await supabase.from("comments").delete().eq("user_id", userId);
    
    // 3. Delete posts (references user)
    await supabase.from("posts").delete().eq("user_id", userId);
    
    // 4. Delete messages (references sender/receiver)
    await supabase.from("messages").delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
    
    // 5. Delete conversations (references user)
    await supabase.from("conversations").delete().or(`user_id.eq.${userId},other_user_id.eq.${userId}`);
    
    // 6. Delete job applications (references user)
    await supabase.from("job_applications").delete().eq("user_id", userId);
    
    // 7. Delete saved jobs (references user)
    await supabase.from("saved_jobs").delete().eq("user_id", userId);
    
    // 8. Delete connections (references user)
    await supabase.from("connections").delete().or(`user_id.eq.${userId},connected_user_id.eq.${userId}`);
    
    // 9. Delete company followers (references user)
    await supabase.from("company_followers").delete().eq("user_id", userId);
    
    // 10. Delete company posts (references user)
    await supabase.from("company_posts").delete().eq("posted_by", userId);
    
    // 11. Delete events (references user)
    await supabase.from("events").delete().eq("user_id", userId);
    
    // 12. Delete event attendees (references user)
    await supabase.from("event_attendees").delete().eq("user_id", userId);
    
    // 13. Update articles (set author to null or delete if owned)
    // We'll set author_id to null for articles by this user
    const { data: userArticles } = await supabase
      .from("articles")
      .select("id")
      .eq("author_id", userId);
    
    if (userArticles && userArticles.length > 0) {
      // Option 1: Delete articles
      await supabase.from("articles").delete().eq("author_id", userId);
      // Option 2: Or keep articles but remove author reference
      // await supabase.from("articles").update({ author_id: null }).eq("author_id", userId);
    }

    // 14. Delete experience entries
    await supabase.from("experience").delete().eq("user_id", userId);
    
    // 15. Delete education entries
    await supabase.from("education").delete().eq("user_id", userId);

    // 16. Delete follow relationships
    await supabase.from("follows").delete().or(`follower_id.eq.${userId},following_id.eq.${userId}`);

    // Finally, delete the profile
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      // Check if it's a foreign key constraint error
      if (profileError.code === "23503") {
        return NextResponse.json(
          { 
            error: "Cannot delete user",
            details: "User still has related data that couldn't be deleted automatically. Please contact database administrator.",
            code: "FOREIGN_KEY_CONSTRAINT"
          },
          { status: 409 }
        );
      }
      throw profileError;
    }

    // Log activity
    await logAdminActivity(admin.id, "delete_user", "user", userId);

    return NextResponse.json({ 
      success: true,
      message: "User and all related data deleted successfully"
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    
    // Provide more detailed error messages
    if (error.code === "23503") {
      return NextResponse.json(
        { 
          error: "Cannot delete user",
          details: "This user has related data that prevents deletion. All related content must be removed first.",
          code: "FOREIGN_KEY_CONSTRAINT"
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        error: "An error occurred while deleting user",
        details: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}
