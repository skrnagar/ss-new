
"use client"

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or key is missing in environment variables')
}

/**
 * Creates a Supabase client for use in browser components.
 * This client is safe to use in client-side code.
 */
// Create a supabase client for use in browser components
export const supabase = createClientComponentClient()

// Function to get a new Supabase client instance
export const getSupabase = () => createClientComponentClient()

// Set up debug listener for auth state changes in development
if (process.env.NODE_ENV === 'development') {
  // Set up a listener for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session ? 'user authenticated' : 'no session')
  })
}
