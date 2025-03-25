import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updatePostsTable() {
  console.log("Updating posts table to include video_url and document_url columns...");

  try {
    // Check if columns already exist
    const { error: columnCheckError } = await supabase
      .from("posts")
      .select("video_url, document_url")
      .limit(1)
      .maybeSingle();

    // If columns already exist, we don't need to add them
    if (!columnCheckError) {
      console.log("Columns video_url and document_url already exist in posts table.");
      return;
    }

    // Add video_url column if it doesn't exist
    const { error: videoColumnError } = await supabase.rpc("add_column_if_not_exists", {
      table_name: "posts",
      column_name: "video_url",
      column_type: "text",
    });

    if (videoColumnError) {
      console.error("Error adding video_url column:", videoColumnError);
    } else {
      console.log("Added video_url column to posts table");
    }

    // Add document_url column if it doesn't exist
    const { error: documentColumnError } = await supabase.rpc("add_column_if_not_exists", {
      table_name: "posts",
      column_name: "document_url",
      column_type: "text",
    });

    if (documentColumnError) {
      console.error("Error adding document_url column:", documentColumnError);
    } else {
      console.log("Added document_url column to posts table");
    }

    // Create storage buckets for files if they don't exist
    const buckets = ["post_images", "post_videos", "post_documents"];

    for (const bucket of buckets) {
      const { error: getBucketError } = await supabase.storage.getBucket(bucket);

      if (getBucketError) {
        // Create bucket if it doesn't exist
        const { error: createBucketError } = await supabase.storage.createBucket(bucket, {
          public: true,
          fileSizeLimit: bucket === "post_videos" ? 100000000 : 10000000, // 100MB for videos, 10MB for others
        });

        if (createBucketError) {
          console.error(`Error creating ${bucket} bucket:`, createBucketError);
        } else {
          console.log(`Created ${bucket} bucket`);
        }
      } else {
        console.log(`${bucket} bucket already exists`);
      }
    }

    console.log("Database update completed successfully");
  } catch (error) {
    console.error("Error updating database:", error);
  }
}

// Run the update
updatePostsTable();
