
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

// List of routes that require authentication
const protectedRoutes = ['/feed', '/profile', '/jobs', '/groups', '/knowledge', '/messages', '/notifications']

// Routes that should redirect to feed if already authenticated
const authRoutes = ['/auth/login', '/auth/register', '/']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Skip middleware for specific paths including static files, API routes, and callbacks
  const url = new URL(request.url)
  const path = url.pathname
  
  // Skip static files, API routes, and favicons
  if (path.startsWith('/_next') || 
      path.includes('/api/') || 
      path.includes('.') ||
      path === '/favicon.ico') {
    return response
  }
  
  // Special handling for auth callback path - crucial for the OAuth flow
  if (path.startsWith('/auth/callback')) {
    console.log('Middleware - Auth callback detected, skipping middleware')
    return response
  }
  
  // Create a Supabase client specifically for the middleware
  const supabase = createMiddlewareClient({ req: request, res: response })
  
  try {
    // Get the session using the supabase middleware client
    const { data: { session } } = await supabase.auth.getSession()
    
    const isAuthenticated = !!session
    const userId = session?.user?.id
    
    // Set the userId in a custom header that can be used by the server components
    if (userId) {
      response.headers.set('x-user-id', userId)
    }
    
    console.log('Middleware - Path:', path, 'Authenticated:', isAuthenticated, 'User ID:', userId || 'none')
    
    // Check if the route is protected and user is not authenticated
    const isProtectedRoute = protectedRoutes.some(route => 
      path === route || path.startsWith(`${route}/`)
    )
    
    if (isProtectedRoute && !isAuthenticated) {
      // Store the original URL to redirect back after login
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirectUrl', path)
      console.log('Redirecting unauthenticated user from protected route to:', redirectUrl.toString())
      
      const redirectResponse = NextResponse.redirect(redirectUrl)
      redirectResponse.headers.set('Cache-Control', 'no-store, max-age=0')
      
      return redirectResponse
    }

    // Check if the user is accessing auth routes while already authenticated
    const isAuthRoute = authRoutes.some(route => 
      path === route || path.startsWith(`${route}/`)
    )
    
    if (isAuthRoute && isAuthenticated) {
      console.log('Redirecting authenticated user from auth route to feed')
      const redirectResponse = NextResponse.redirect(new URL('/feed', request.url))
      redirectResponse.headers.set('Cache-Control', 'no-store, max-age=0')
      
      return redirectResponse
    }
  } catch (error) {
    console.error('Error in auth middleware:', error)
  }

  // Set cache control headers to prevent response caching for all routes
  response.headers.set('Cache-Control', 'no-store, max-age=0')
  
  return response
}

export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
