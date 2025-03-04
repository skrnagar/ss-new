
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // If code is present, exchange it for a session
  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      
      await supabase.auth.exchangeCodeForSession(code)
      
      // Get any redirectUrl that was passed
      const redirectTo = requestUrl.searchParams.get('redirectTo') || '/feed'
      
      console.log('Auth callback successful, redirecting to:', redirectTo)
      
      // Return a response that redirects to the feed or specified redirect
      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
    } catch (error) {
      console.error('Error in auth callback:', error)
      return NextResponse.redirect(new URL('/auth/login?error=auth_callback_failed', requestUrl.origin))
    }
  }
  
  // If no code, redirect to home
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
}
