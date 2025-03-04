
import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key in environment variables')
}

// Create a single Supabase client instance
let supabaseInstance: any = null;

// Client for use in browser components (singleton pattern)
export const supabase = typeof window === 'undefined' 
  ? createClientComponentClient({ supabaseUrl, supabaseKey: supabaseAnonKey })
  : (() => {
      if (!supabaseInstance) {
        supabaseInstance = createClientComponentClient({ 
          supabaseUrl, 
          supabaseKey: supabaseAnonKey 
        });
      }
      return supabaseInstance;
    })();

// Legacy client with additional config options - maintain for compatibility
export const supabaseClient = supabase;

// Set up debug listener for auth state changes in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === "development") {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session)
  })
}
