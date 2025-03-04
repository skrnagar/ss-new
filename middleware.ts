
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

// List of routes that require authentication
const protectedRoutes = ['/feed', '/profile', '/jobs', '/groups', '/knowledge', '/messages', '/notifications']

// Routes that should redirect to feed if already authenticated
const authRoutes = ['/auth/login', '/auth/register', '/']

export async function middleware(request: NextRequest) {
  // Create a response to modify
  const res = NextResponse.next()
  
  // Create a Supabase client specifically for the middleware
  const supabase = createMiddlewareClient({ req: request, res })
  
  // Get the session using the supabase middleware client
  const { data } = await supabase.auth.getSession()
  const session = data?.session
  const isAuthenticated = !!session
  
  console.log('Middleware - Auth status:', isAuthenticated ? 'Authenticated' : 'Not authenticated')
  
  const url = new URL(request.url)
  const path = url.pathname
  
  // Skip middleware for specific paths
  if (path.startsWith('/auth/callback') || 
      path.includes('/_next') || 
      path.includes('/api/') || 
      path.includes('.')) {
    return res
  }
  
  // Check if the route is protected and user is not authenticated
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  )
  
  if (isProtectedRoute && !isAuthenticated) {
    // Store the original URL to redirect back after login
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirectUrl', url.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Check if the user is accessing auth routes while already authenticated
  const isAuthRoute = authRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  )
  
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/feed', request.url))
  }

  return res
}

export const config = {
  matcher: [
    // Match all routes except static files and api routes
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
