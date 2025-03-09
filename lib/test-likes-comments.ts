import { supabase } from "./supabase";

async function testLikesComments() {
  console.log("Testing likes and comments functionality...");

  try {
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error getting user:", userError);
      return;
    }

    if (!user) {
      console.error("No authenticated user found. Please sign in first.");
      return;
    }

    console.log("Authenticated as user:", user.id);

    // Get a post to interact with
    const { data: posts, error: postsError } = await supabase.from("posts").select("id").limit(1);

    if (postsError) {
      console.error("Error fetching posts:", postsError);
      return;
    }

    if (!posts || posts.length === 0) {
      console.error("No posts found to test with. Please create a post first.");
      return;
    }

    const postId = posts[0].id;
    console.log("Using post with ID:", postId);

    // Test adding a like
    console.log("1. Testing like functionality...");
    const { data: likeData, error: likeError } = await supabase
      .from("likes")
      .insert({
        post_id: postId,
        user_id: user.id,
      })
      .select();

    if (likeError) {
      console.error("Error adding like:", likeError);
      console.log("RLS policy might be preventing the like action.");
    } else {
      console.log("Like added successfully:", likeData);

      // Try to delete the like
      const { error: unlikeError } = await supabase
        .from("likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);

      if (unlikeError) {
        console.error("Error removing like:", unlikeError);
      } else {
        console.log("Like removed successfully!");
      }
    }

    // Test adding a comment
    console.log("\n2. Testing comment functionality...");
    const testComment = `Test comment ${new Date().toISOString()}`;

    const { data: commentData, error: commentError } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        content: testComment,
      })
      .select();

    if (commentError) {
      console.error("Error adding comment:", commentError);
      console.log("RLS policy might be preventing the comment action.");
    } else {
      console.log("Comment added successfully:", commentData);

      if (commentData && commentData[0] && commentData[0].id) {
        // Try to delete the comment
        const { error: deleteCommentError } = await supabase
          .from("comments")
          .delete()
          .eq("id", commentData[0].id);

        if (deleteCommentError) {
          console.error("Error deleting comment:", deleteCommentError);
        } else {
          console.log("Comment deleted successfully!");
        }
      }
    }

    console.log("\nTests completed!");
  } catch (error) {
    console.error("Unexpected error during tests:", error);
  }
}

// Run the test
testLikesComments();
