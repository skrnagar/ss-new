
import { createServerClient } from '@supabase/ssr'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

// For pages directory - does not use next/headers
export function createClient(context: any = null) {
  if (!context || !context.req) {
    // Running in an environment without context (app directory or other)
    throw new Error('When using in pages directory, context with req and res must be provided')
  }

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
          return context.req.cookies[name]
        },
        set(name, value, options) {
          if (context.res) {
            context.res.setHeader('Set-Cookie', `${name}=${value}; Path=/; ${options.maxAge ? `Max-Age=${options.maxAge};` : ''}`)
          }
        },
        remove(name, options) {
          if (context.res) {
            context.res.setHeader('Set-Cookie', `${name}=; Path=/; Max-Age=0;`)
          }
        },
      },
    }
  )
}

// Legacy client for pages directory
export function createLegacyClient(context: any = null) {
  if (!context) {
    throw new Error('Context must be provided for pages directory')
  }
  return createServerComponentClient<Database>({
    cookies: () => context.req.cookies
  })
}

// For app directory (using app router) we need a separate file as this can't be imported in pages/
// Create a separate file called lib/supabase-app-server.ts for app directory usage
