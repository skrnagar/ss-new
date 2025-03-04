
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// List of routes that require authentication
const protectedRoutes = ['/feed', '/profile', '/jobs', '/groups', '/knowledge', '/messages', '/notifications']

// Routes that should redirect to feed if already authenticated
const authRoutes = ['/auth/login', '/auth/register']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // For server-side auth checking, create a new Supabase client on each request
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project-url.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
  
  // Get the user's session from cookies
  const { data: { session } } = await supabase.auth.getSession()
  
  const url = new URL(request.url)
  const path = url.pathname
  
  // Root page redirect to feed for authenticated users
  if (path === '/' && session) {
    return NextResponse.redirect(new URL('/feed', request.url))
  }

  // Check if the route is protected and user is not authenticated
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  )
  
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Check if the user is accessing auth routes while already authenticated
  const isAuthRoute = authRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  )
  
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/feed', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Match all routes except static files, api routes, and auth callback
    '/((?!_next/static|_next/image|favicon.ico|api|auth/callback).*)',
  ],
}
