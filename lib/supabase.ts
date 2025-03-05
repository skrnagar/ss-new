import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key in environment variables')
}

// Create a singleton Supabase client for client-side usage
export const supabase = createClientComponentClient<Database>()

// Export a function that provides a fresh client instance when needed
export const getSupabase = () => createClientComponentClient<Database>()

// Removed auth listener to prevent multiple listeners