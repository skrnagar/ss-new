
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or key is missing in environment variables')
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}

// Create a single instance of the supabase client to be used across the app
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient()
  }
  return supabaseInstance
}

// Listen for auth state changes and log them
if (typeof window !== 'undefined') {
  const supabase = getSupabase()
  
  supabase.auth.onAuthStateChange((event, session) => {
    const userState = session ? 'user authenticated' : 'no session'
    console.log('Auth state changed:', event, userState)
    
    // Clear navigation cache when auth state changes to ensure fresh data
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
      try {
        // Clear any cached responses to force refetching
        if ('caches' in window) {
          caches.keys().then((names) => {
            names.forEach((name) => {
              caches.delete(name)
            })
          })
        }
      } catch (e) {
        console.error('Error clearing cache:', e)
      }
    }
  })
}
