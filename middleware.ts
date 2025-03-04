
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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

  // For development, we'll mock authentication status
  // In a real implementation, this would check Supabase session
  const hasMockSession = request.cookies.has('mockSession')
  const url = new URL(request.url)
  const path = url.pathname

  // For development, allow access to all routes
  // Uncomment the following code when you have Supabase set up

  /*
  // Check if the route is protected and user is not authenticated
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  )
  
  if (isProtectedRoute && !hasMockSession) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Check if the user is accessing auth routes while already authenticated
  const isAuthRoute = authRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  )
  
  if (isAuthRoute && hasMockSession) {
    return NextResponse.redirect(new URL('/feed', request.url))
  }
  */

  return response
}

export const config = {
  matcher: [
    // Match all routes except static files, api routes, and auth callback
    '/((?!_next/static|_next/image|favicon.ico|api|auth/callback).*)',
  ],
}
