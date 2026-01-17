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
