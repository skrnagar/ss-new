
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

// Initialize auth listener for debugging
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session)
    
    // Force reload protected pages on sign-in to apply the middleware
    if (event === 'SIGNED_IN') {
      const pathName = window.location.pathname
      const searchParams = new URLSearchParams(window.location.search)
      const redirectUrl = searchParams.get('redirectUrl')
      
      // Check if we're on login page and have a redirect URL
      if (pathName.includes('/auth/login') && redirectUrl) {
        console.log('Redirecting to:', redirectUrl)
        window.location.href = redirectUrl
        return
      }
      
      // If we're on a login page or home page without a specific redirect, go to feed
      if (pathName === '/' || pathName.includes('/auth/')) {
        console.log('Redirecting to feed after sign in')
        window.location.href = '/feed'
        return
      }
    } else if (event === 'SIGNED_OUT') {
      // Redirect to home page on sign out
      window.location.href = '/'
    }
  })
}
