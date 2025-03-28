
const { createClient } = require('@supabase/supabase-js');

// Check for required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// Create client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function setupStorageBuckets() {
  console.log("Setting up storage buckets...");

  try {
    // Create article-covers bucket with proper configuration
    const { error: coversBucketError } = await supabase.storage.createBucket(
      "article-covers",
      {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
        mimeTypes: {
          'png': 'image/png',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'gif': 'image/gif',
          'webp': 'image/webp'
        }
      }
    );

    if (coversBucketError) {
      if (coversBucketError.message === "The resource already exists") {
        console.log("article-covers bucket already exists");
      } else {
        console.error("Error creating article-covers bucket:", coversBucketError);
      }
    } else {
      console.log("article-covers bucket created successfully");
    }

    // Update storage policies for article-covers bucket
    const { error: policyError } = await supabase.storage.updateBucket("article-covers", {
      public: true,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
      fileSizeLimit: 10485760,
      preserveFileExtensions: true,
      useOriginalFilename: true
    });

    if (policyError) {
      console.error("Error updating article-covers bucket policy:", policyError);
    }

    console.log("Storage buckets setup complete");
    return { success: true };
  } catch (error) {
    console.error("Error setting up storage buckets:", error);
    return { success: false, error };
  }
}

setupStorageBuckets();
