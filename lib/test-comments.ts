import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with appropriate credentials
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const testComments = async () => {
  try {
    console.log("Testing comment functionality...");

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

    // Get a post to comment on (first post in the database)
    const { data: posts, error: postsError } = await supabase.from("posts").select("id").limit(1);

    if (postsError) {
      console.error("Error fetching posts:", postsError);
      return;
    }

    if (!posts || posts.length === 0) {
      console.error("No posts found to comment on. Please create a post first.");
      return;
    }

    const postId = posts[0].id;
    console.log("Using post with ID:", postId);

    // Test inserting a comment
    const testComment = `Test comment ${new Date().toISOString()}`;
    console.log("Inserting comment:", testComment);

    const { data: newComment, error: commentError } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        content: testComment,
      })
      .select();

    if (commentError) {
      console.error("Error inserting comment:", commentError);
      // Log specific details about RLS policy issues
      if (commentError.code === "42501") {
        console.error("This appears to be a permissions issue with Row Level Security (RLS).");
      }
      return;
    }

    console.log("Comment inserted successfully:", newComment);

    // Test fetching the comment
    const { data: fetchedComments, error: fetchError } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (fetchError) {
      console.error("Error fetching comments:", fetchError);
      return;
    }

    console.log("Latest 5 comments for this post:", fetchedComments);

    console.log("Comment test completed successfully!");
  } catch (error) {
    console.error("Unexpected error during comment test:", error);
  }
};

testComments();
