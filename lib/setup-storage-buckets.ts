import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config()

async function setupStorageBuckets() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Required environment variables are missing')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Define buckets we need
  const buckets = [
    { name: 'avatars', public: true },
    { name: 'post-images', public: true },
    { name: 'post-videos', public: true },
    { name: 'post-documents', public: true }
  ]

  // Create each bucket
  for (const bucket of buckets) {
    console.log(`Setting up bucket: ${bucket.name}...`)

    // Check if bucket exists
    const { data: existingBucket, error: checkError } = await supabase
      .storage
      .getBucket(bucket.name)

    if (checkError && checkError.message !== 'Bucket not found') {
      console.error(`Error checking bucket ${bucket.name}:`, checkError)
      continue
    }

    // Create bucket if it doesn't exist
    if (!existingBucket) {
      const { data, error } = await supabase
        .storage
        .createBucket(bucket.name, {
          public: bucket.public,
          fileSizeLimit: 10485760, // 10MB
        })

      if (error) {
        console.error(`Error creating bucket ${bucket.name}:`, error)
      } else {
        console.log(`Created bucket: ${bucket.name}`)
      }
    } else {
      console.log(`Bucket already exists: ${bucket.name}`)

      // Update bucket to ensure correct settings
      const { error } = await supabase
        .storage
        .updateBucket(bucket.name, {
          public: bucket.public,
          fileSizeLimit: 10485760, // 10MB
        })

      if (error) {
        console.error(`Error updating bucket ${bucket.name}:`, error)
      } else {
        console.log(`Updated bucket: ${bucket.name}`)
      }
    }
  }

  console.log('Storage buckets setup complete')
}

setupStorageBuckets()
  .catch(console.error)