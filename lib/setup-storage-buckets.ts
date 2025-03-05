
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupStorageBuckets() {
  console.log('Setting up storage buckets for posts...')
  
  try {
    // Create buckets for different file types if they don't exist
    const buckets = [
      { name: 'post_images', public: true, fileSizeLimit: 10000000 }, // 10MB for images
      { name: 'post_videos', public: true, fileSizeLimit: 100000000 }, // 100MB for videos
      { name: 'post_documents', public: true, fileSizeLimit: 10000000 }, // 10MB for docs
    ]
    
    for (const bucket of buckets) {
      // Check if bucket exists
      const { error: getBucketError } = await supabase.storage.getBucket(bucket.name)
      
      if (getBucketError) {
        // Create bucket if it doesn't exist
        const { error: createBucketError } = await supabase.storage.createBucket(bucket.name, {
          public: bucket.public,
          fileSizeLimit: bucket.fileSizeLimit
        })
        
        if (createBucketError) {
          console.error(`Error creating ${bucket.name} bucket:`, createBucketError)
        } else {
          console.log(`Created ${bucket.name} bucket successfully`)
        }
      } else {
        console.log(`Bucket ${bucket.name} already exists`)
        
        // Update bucket options
        const { error: updateBucketError } = await supabase.storage.updateBucket(bucket.name, {
          public: bucket.public,
          fileSizeLimit: bucket.fileSizeLimit
        })
        
        if (updateBucketError) {
          console.error(`Error updating ${bucket.name} bucket:`, updateBucketError)
        } else {
          console.log(`Updated ${bucket.name} bucket options`)
        }
      }
    }
    
    console.log('Storage buckets setup completed')
  } catch (error) {
    console.error('Error setting up storage buckets:', error)
  }
}

// Run the function
setupStorageBuckets()
