import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const redirectTo = requestUrl.searchParams.get('redirectTo') || '/feed'

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

      // Exchange the code for a session
      await supabase.auth.exchangeCodeForSession(code)

      // Get the user profile from the session
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        console.log('User authenticated in callback:', session.user.id)

        // Check if the user has a profile already
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        // Create an empty profile if it doesn't exist
        if (!profile) {
          await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || '',
              avatar_url: session.user.user_metadata?.avatar_url || '',
              created_at: new Date().toISOString(),
            })

          // Redirect to profile setup if this is a new user
          console.log('New user - redirecting to profile setup')
          return NextResponse.redirect(new URL('/profile/setup', request.url))
        }
      }
    }

    // Make sure we have a valid redirect URL
    let finalRedirectUrl = redirectTo;
    if (finalRedirectUrl.startsWith('/')) {
      finalRedirectUrl = new URL(finalRedirectUrl, request.url).toString();
    }

    console.log('Redirecting to:', finalRedirectUrl);
    return NextResponse.redirect(finalRedirectUrl);
  } catch (error) {
    console.error('Error in auth callback:', error)
    return NextResponse.redirect(new URL('/auth/login?error=callback', request.url))
  }
}