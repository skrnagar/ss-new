import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with proper environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project-url.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'safety-shaper-auth-key',
  },
})