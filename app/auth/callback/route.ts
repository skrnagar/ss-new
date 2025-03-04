
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectUrl = requestUrl.searchParams.get('redirectUrl') || '/feed'
  
  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
    
    // Set cache control headers to prevent caching
    const response = NextResponse.redirect(`${requestUrl.origin}${redirectUrl}`, {
      status: 302,
    })
    
    response.headers.set('Cache-Control', 'no-store, max-age=0')
    
    // Log for debugging
    console.log('Auth callback - Redirecting to:', redirectUrl)
    
    return response
  }

  // If there is no code, something went wrong
  return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=auth_callback_error`, {
    status: 302,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}
