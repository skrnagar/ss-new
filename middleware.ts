import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = [
  '/feed',
  '/profile/setup',
  '/profile',
  '/settings',
  '/messages',
  '/notifications',
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Check if the user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get the pathname of the request
  const { pathname } = req.nextUrl

  // Check if the route is protected and user is not authenticated
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !session) {
    // Redirect to login page if not authenticated
    const redirectUrl = new URL('/auth/login', req.url)
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If authenticated and trying to access login, redirect to feed
  if (session && pathname === '/auth/login') {
    return NextResponse.redirect(new URL('/feed', req.url))
  }

  return res
}

export const config = {
  // Specify which paths the middleware should run on
  matcher: [
    '/feed/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/messages/:path*',
    '/notifications/:path*',
    '/auth/login',
  ],
}