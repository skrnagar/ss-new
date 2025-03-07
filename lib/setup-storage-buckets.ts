import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const setupAvatarsBucket = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY 
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or key in environment variables')
    return
  }

  const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log('Setting up avatars storage bucket...')

    // Create the avatars bucket if it doesn't exist
    const { data: existingBuckets, error: listError } = await supabaseClient.storage.listBuckets()

    if (listError) {
      console.error('Error listing buckets:', listError)
      return
    }

    const avatarBucketExists = existingBuckets.some(bucket => bucket.name === 'avatars')

    if (!avatarBucketExists) {
      // Create the avatars bucket
      const { data, error } = await supabaseClient.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        fileSizeLimit: 2097152 // 2MB
      })

      if (error) {
        console.error('Error creating avatars bucket:', error)
        return
      }

      console.log('Avatars bucket created successfully')
    } else {
      console.log('Avatars bucket already exists')
    }

    // Set up default RLS policies for the bucket
    const setupRLSPolicySql = `
      -- Anyone can read from the avatars bucket
      BEGIN;

      DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;

      CREATE POLICY "Allow public read access" 
      ON storage.objects FOR SELECT 
      USING (bucket_id = 'avatars');

      -- Only authenticated users can upload their own avatars
      DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;

      CREATE POLICY "Allow authenticated uploads" 
      ON storage.objects FOR INSERT 
      WITH CHECK (
        bucket_id = 'avatars' AND 
        auth.role() = 'authenticated'
      );

      COMMIT;
    `

    const { error: policyError } = await supabaseClient.rpc('exec_sql', { sql_query: setupRLSPolicySql })

    if (policyError) {
      console.error('Error setting up RLS policies:', policyError)
    } else {
      console.log('RLS policies set up successfully')
    }

  } catch (error) {
    console.error('Error setting up avatars storage bucket:', error)
  }
}


export async function setupStorageBuckets() {
  console.log('Setting up storage buckets...')

  try {
    // Create post-images bucket
    const { data: imagesBucket, error: imagesBucketError } = await supabase.storage
      .createBucket('post-images', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf']
      })

    if (imagesBucketError && imagesBucketError.message !== 'Bucket already exists') {
      console.error('Error creating post-images bucket:', imagesBucketError)
    } else {
      console.log('post-images bucket created or already exists')
    }

    // Create post-videos bucket
    const { data: videosBucket, error: videosBucketError } = await supabase.storage
      .createBucket('post-videos', {
        public: true,
        fileSizeLimit: 104857600, // 100MB
        allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/webm']
      })

    if (videosBucketError && videosBucketError.message !== 'Bucket already exists') {
      console.error('Error creating post-videos bucket:', videosBucketError)
    } else {
      console.log('post-videos bucket created or already exists')
    }

    // Create post-documents bucket
    const { data: documentsBucket, error: documentsBucketError } = await supabase.storage
      .createBucket('post-documents', {
        public: true,
        fileSizeLimit: 20971520, // 20MB
        allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      })

    if (documentsBucketError && documentsBucketError.message !== 'Bucket already exists') {
      console.error('Error creating post-documents bucket:', documentsBucketError)
    } else {
      console.log('post-documents bucket created or already exists')
    }

    // Set public bucket policies for each bucket
    for (const bucketName of ['post-images', 'post-videos', 'post-documents']) {
      const { error: policyError } = await supabase.storage
        .from(bucketName)
        .getPublicUrl('test')

      if (policyError) {
        // If bucket doesn't have public policy, set it
        const { error: updatePolicyError } = await supabase.storage
          .updateBucket(bucketName, {
            public: true
          })

        if (updatePolicyError) {
          console.error(`Error setting public policy for ${bucketName}:`, updatePolicyError)
        } else {
          console.log(`Public policy set for ${bucketName}`)
        }
      }
    }

    await setupAvatarsBucket(); // Added call to setup the avatars bucket.

    console.log('Storage buckets setup complete')
    return { success: true }
  } catch (error) {
    console.error('Error setting up storage buckets:', error)
    return { success: false, error }
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupStorageBuckets()
}