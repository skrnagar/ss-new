
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const searchParams = requestUrl.searchParams
  const code = searchParams.get('code')
  const redirectUrl = searchParams.get('redirectUrl') || '/feed'
  
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

    // Make sure to encode any special characters in the URL
    let finalRedirectUrl = '/feed'
    if (redirectUrl) {
      try {
        // Handle redirectUrl properly
        finalRedirectUrl = decodeURIComponent(redirectUrl)
      } catch (e) {
        console.error('Error decoding redirectUrl:', e)
      }
    }

    console.log('Auth callback successful, redirecting to:', finalRedirectUrl)
    
    // Set no-store header to prevent caching
    const response = NextResponse.redirect(new URL(finalRedirectUrl, requestUrl.origin))
    response.headers.set('Cache-Control', 'no-store, max-age=0')
    
    return response
  } catch (error) {
    console.error('Error in callback:', error)
    return NextResponse.redirect(
      new URL(`/auth/login?error=Something+went+wrong`, requestUrl.origin)
    )
  }
}
