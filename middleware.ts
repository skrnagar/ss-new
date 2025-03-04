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

  // Check for authentication by looking for the Supabase auth cookie
  const authCookie = request.cookies.get('sb-auth-token')
  const isAuthenticated = !!authCookie?.value

  const url = new URL(request.url)
  const path = url.pathname

  // Root page redirect to feed for authenticated users
  if (path === '/' && isAuthenticated) {
    return NextResponse.redirect(new URL('/feed', request.url))
  }

  // Check if the route is protected and user is not authenticated
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  )

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Check if the user is accessing auth routes while already authenticated
  const isAuthRoute = authRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  )

  if (isAuthRoute && isAuthenticated) {
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