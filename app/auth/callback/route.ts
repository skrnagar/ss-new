
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const searchParams = requestUrl.searchParams
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirectTo') || '/feed'
  
  // If there is no code, something went wrong with the OAuth process
  if (!code) {
    console.error('No code provided in callback')
    return NextResponse.redirect(new URL('/auth/login?error=No+code+provided', requestUrl.origin))
  }

  try {
    // Create a supabase client for the route handler
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error in callback:', error.message)
      throw error
    }

    // Successfully exchanged code for session - redirect to the intended URL
    console.log('Authentication successful, redirecting to:', redirectTo)
    
    // Ensure the redirect URL is properly decoded
    const decodedRedirectTo = decodeURIComponent(redirectTo)
    
    // Create a response that redirects to the decoded URL
    const redirectResponse = NextResponse.redirect(new URL(decodedRedirectTo, requestUrl.origin))
    
    // Ensure no caching
    redirectResponse.headers.set('Cache-Control', 'no-store, max-age=0')
    
    return redirectResponse
  } catch (error) {
    console.error('Error in auth callback:', error)
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error.message || 'Unknown error')}`, requestUrl.origin)
    )
  }
}
