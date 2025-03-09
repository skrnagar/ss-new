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

export async function setupAvatarsBucket() {
  console.log("Setting up avatars bucket...");

  try {
    // Check if bucket already exists
    const { error: getBucketError } = await supabase.storage.getBucket("avatars");

    if (getBucketError) {
      console.log("Avatars bucket does not exist, creating...");

      // Create bucket if it doesn't exist
      const { error: createBucketError } = await supabase.storage.createBucket("avatars", {
        public: true,
        fileSizeLimit: 5242880, // 5MB limit for avatars
        allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
      });

      if (createBucketError) {
        console.error("Error creating avatars bucket:", createBucketError);
        return { success: false, error: createBucketError };
      } else {
        console.log("Created avatars bucket successfully");

        // Check if bucket needs public policy by attempting to get a URL
        // (getPublicUrl doesn't return an error, so we need to handle it differently)
        const { data } = await supabase.storage.from("avatars").getPublicUrl("test");

        // Update bucket to be public (regardless of the result)
        const { error: updateError } = await supabase.storage.updateBucket("avatars", {
          public: true,
        });

        if (updateError) {
          console.error("Error setting public policy for avatars bucket:", updateError);
        } else {
          console.log("Set public policy for avatars bucket");
        }
      }
    } else {
      console.log("Avatars bucket already exists");
    }

    return { success: true };
  } catch (error) {
    console.error("Error in setupAvatarsBucket:", error);
    return { success: false, error };
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  setupAvatarsBucket()
    .then((result) => {
      console.log("Setup result:", result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((err) => {
      console.error("Unexpected error:", err);
      process.exit(1);
    });
}
