
'use client'

import { createServerClient } from '@supabase/ssr'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

// This creates a Supabase client for server-side operations in the app directory
// Only use this in the app directory, not in pages!
export function createClient() {
  // We're in a client component, so we can't use next/headers directly
  // Instead, rely on cookies from the browser
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
          return document.cookie
            .split('; ')
            .find(row => row.startsWith(`${name}=`))
            ?.split('=')[1]
        },
        set(name, value, options) {
          let cookie = `${name}=${value}`
          if (options?.maxAge) cookie += `; Max-Age=${options.maxAge}`
          if (options?.path) cookie += `; Path=${options.path}`
          document.cookie = cookie
        },
        remove(name, options) {
          document.cookie = `${name}=; Max-Age=0${options?.path ? `; Path=${options.path}` : ''}`
        },
      },
    }
  )
}

// Legacy client using auth-helpers-nextjs (client-side version)
export function createLegacyClient() {
  return createServerComponentClient<Database>({
    cookies: () => {
      const cookieStore: Record<string, string> = {}
      document.cookie.split('; ').forEach(cookie => {
        const [name, value] = cookie.split('=')
        cookieStore[name] = value
      })
      return cookieStore
    }
  })
}
