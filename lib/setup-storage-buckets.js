
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function setupStorageBuckets() {
  console.log("Setting up storage buckets...");

  try {
    // Create article-covers bucket with proper configuration
    const { data: coversBucket, error: coversBucketError } = await supabase.storage.createBucket(
      "article-covers",
      {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
      }
    );

    if (coversBucketError && coversBucketError.message !== "Bucket already exists") {
      console.error("Error creating article-covers bucket:", coversBucketError);
    } else {
      console.log("article-covers bucket created or already exists");
    }

    // Update storage policies for article-covers bucket
    const { error: policyError } = await supabase.storage.updateBucket("article-covers", {
      public: true,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
      fileSizeLimit: 10485760,
    });

    if (policyError) {
      console.error("Error updating article-covers bucket policy:", policyError);
    }

    // Set public bucket policies
    try {
      await supabase.storage.from("article-covers").getPublicUrl("test");
    } catch (policyError) {
      const { error: updatePolicyError } = await supabase.storage.updateBucket("article-covers", {
        public: true,
      });

      if (updatePolicyError) {
        console.error("Error setting public policy for article-covers:", updatePolicyError);
      } else {
        console.log("Public policy set for article-covers");
      }
    }

    console.log("Storage buckets setup complete");
    return { success: true };
  } catch (error) {
    console.error("Error setting up storage buckets:", error);
    return { success: false, error };
  }
}

setupStorageBuckets();
