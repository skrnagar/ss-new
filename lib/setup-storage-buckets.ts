import { supabase } from "@/lib/supabase";

export async function setupStorageBuckets() {
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


    // Create post-images bucket
    const { data: imagesBucket, error: imagesBucketError } = await supabase.storage.createBucket(
      "post-images",
      {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp", "application/pdf"],
      }
    );

    if (imagesBucketError && imagesBucketError.message !== "Bucket already exists") {
      console.error("Error creating post-images bucket:", imagesBucketError);
    } else {
      console.log("post-images bucket created or already exists");
    }

    // Create post-videos bucket
    const { data: videosBucket, error: videosBucketError } = await supabase.storage.createBucket(
      "post-videos",
      {
        public: true,
        fileSizeLimit: 104857600, // 100MB
        allowedMimeTypes: ["video/mp4", "video/quicktime", "video/webm"],
      }
    );

    if (videosBucketError && videosBucketError.message !== "Bucket already exists") {
      console.error("Error creating post-videos bucket:", videosBucketError);
    } else {
      console.log("post-videos bucket created or already exists");
    }

    // Create post-documents bucket
    const { data: documentsBucket, error: documentsBucketError } =
      await supabase.storage.createBucket("post-documents", {
        public: true,
        fileSizeLimit: 20971520, // 20MB
        allowedMimeTypes: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      });

    if (documentsBucketError && documentsBucketError.message !== "Bucket already exists") {
      console.error("Error creating post-documents bucket:", documentsBucketError);
    } else {
      console.log("post-documents bucket created or already exists");
    }

    // Set public bucket policies for each bucket
    for (const bucketName of ["post-images", "post-videos", "post-documents", "article-covers"]) {
      try {
        await supabase.storage.from(bucketName).getPublicUrl("test");
      } catch (policyError) {
        // If bucket doesn't have public policy, set it
        const { error: updatePolicyError } = await supabase.storage.updateBucket(bucketName, {
          public: true,
        });

        if (updatePolicyError) {
          console.error(`Error setting public policy for ${bucketName}:`, updatePolicyError);
        } else {
          console.log(`Public policy set for ${bucketName}`);
        }
      }
    }

    console.log("Storage buckets setup complete");
    return { success: true };
  } catch (error) {
    console.error("Error setting up storage buckets:", error);
    return { success: false, error };
  }
}