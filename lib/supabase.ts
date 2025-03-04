
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
      const protectedRoutes = ['/feed', '/profile', '/jobs', '/groups', '/knowledge', '/messages', '/notifications']
      
      // If we're on a login page or home page, navigate to feed
      if (pathName === '/' || pathName === '/auth/login' || pathName.includes('/auth/')) {
        console.log('Redirecting to feed after sign in')
        window.location.href = '/feed'
        return
      }
      
      // If we're already on a protected route, refresh the page
      if (protectedRoutes.some(route => pathName === route || pathName.startsWith(`${route}/`))) {
        console.log('Already on protected route, refreshing')
        window.location.reload()
      }
    } else if (event === 'SIGNED_OUT') {
      // Redirect to home page on sign out
      window.location.href = '/'
    }
  })
}
