
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cache } from 'react'

// Create a cached version of the client to improve performance
export const createLegacyClient = cache(() => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
});

// New SSR client creation function
export function createClient() {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

// Legacy client for backward compatibility
export const createServerClient = () => {
  const cookieStore = cookies()
  
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}
