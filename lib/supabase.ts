
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key in environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
})

// Initialize auth listener for debugging but prevent redirect loops
if (typeof window !== 'undefined') {
  let isRedirecting = false;
  
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session ? 'user authenticated' : 'no session')
    
    // Prevent multiple redirects
    if (isRedirecting) return;
    
    // Handle sign out only - let middleware and callback handle successful sign in
    if (event === 'SIGNED_OUT') {
      isRedirecting = true;
      // Redirect to home page on sign out
      window.location.href = '/'
    }
  })
}
