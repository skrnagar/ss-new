import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    // Get the redirectUrl parameter, decode it if it exists, and default to '/feed'
    let redirectUrl = '/feed'
    const encodedRedirectUrl = requestUrl.searchParams.get('redirectUrl')

    if (encodedRedirectUrl) {
      try {
        // Properly decode the redirect URL
        redirectUrl = decodeURIComponent(encodedRedirectUrl)
      } catch (e) {
        console.error('Error decoding redirect URL:', e)
      }
    }

    console.log('Auth callback - Code exists:', !!code, 'Redirect URL:', redirectUrl)

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

      // Exchange the code for a session
      await supabase.auth.exchangeCodeForSession(code)

      // Get the user profile from the session
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        console.log('User authenticated in callback:', session.user.id, 'Redirecting to:', redirectUrl)
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }
    }

    // Fallback if no code or session, redirect to home page
    return NextResponse.redirect(new URL('/', request.url))
  } catch (error) {
    console.error('Error in auth callback:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}