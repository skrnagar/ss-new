
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
  const { data: { session } } = await supabase.auth.getSession()
  const isAuthenticated = !!session
  
  const url = new URL(request.url)
  const path = url.pathname
  
  // Skip middleware for specific paths including static files and API routes
  if (path.startsWith('/auth/callback') || 
      path.includes('/_next') || 
      path.includes('/api/') || 
      path.includes('.') ||
      path === '/favicon.ico') {
    return res
  }
  
  console.log('Middleware - Path:', path, 'Authenticated:', isAuthenticated)
  
  // Check if the route is protected and user is not authenticated
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  )
  
  if (isProtectedRoute && !isAuthenticated) {
    // Store the original URL to redirect back after login
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirectUrl', path)
    console.log('Redirecting unauthenticated user from protected route to:', redirectUrl.toString())
    return NextResponse.redirect(redirectUrl)
  }

  // Check if the user is accessing auth routes while already authenticated
  const isAuthRoute = authRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  )
  
  if (isAuthRoute && isAuthenticated) {
    console.log('Redirecting authenticated user from auth route to feed')
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
