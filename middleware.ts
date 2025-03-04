
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = [
  '/feed',
  '/profile',
  '/jobs',
  '/groups',
  '/knowledge',
  '/messages',
  '/notifications',
  '/settings',
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Create a Supabase client specific to this middleware
  const supabase = createMiddlewareClient({ req, res })
  
  // Get session - avoid always refreshing unless needed
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  // Check if the path is protected
  const path = req.nextUrl.pathname
  
  if (protectedRoutes.some(route => path === route || path.startsWith(`${route}/`))) {
    if (!session) {
      // Redirect to login page with return URL
      const redirectUrl = new URL('/auth/login', req.url)
      redirectUrl.searchParams.set('returnTo', path)
      return NextResponse.redirect(redirectUrl)
    }
  }
  
  // Redirect logged-in users away from auth pages
  if (session && (path === '/auth/login' || path === '/auth/register' || path === '/')) {
    return NextResponse.redirect(new URL('/feed', req.url))
  }
  
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)',
  ],
}
