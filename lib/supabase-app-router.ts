
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

// This creates a Supabase client for server-side operations using @supabase/ssr
// Only use this in Server Components within the app directory!
export function createAppRouterClient() {
  const cookieStore = cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or key is missing in environment variables')
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name, options) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

// Legacy client using auth-helpers-nextjs
export function createLegacyAppRouterClient() {
  return createServerComponentClient<Database>({
    cookies,
  })
}
