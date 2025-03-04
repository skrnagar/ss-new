
/**
 * Sets up the Supabase client with authentication configurations
 */
import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key in environment variables')
}

// Create supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
})

// Function to get a new Supabase client instance
export const getSupabase = () => createClientComponentClient()

// Set up debug listener for auth state changes in development
if (process.env.NODE_ENV === "development") {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session)
  })
}
