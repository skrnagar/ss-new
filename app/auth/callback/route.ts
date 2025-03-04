
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
        console.log('User authenticated in callback:', session.user.id)

        // Check if the user has a profile already
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        // If the profile doesn't exist, create it
        if (!profile) {
          console.log('Creating new profile for user:', session.user.id)
          
          // Extract data from user metadata for the profile
          const { user } = session
          const name = user.user_metadata.name || user.user_metadata.full_name
          const avatarUrl = user.user_metadata.avatar_url || user.user_metadata.picture
          
          // Insert the new profile
          await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            name: name,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
          })
        }

        // Get the final redirect URL, clean it up if needed
        redirectUrl = redirectUrl.startsWith('/') ? redirectUrl : `/${redirectUrl}`
        
        // Redirect the user to the intended page or the feed
        console.log('Redirecting authenticated user to:', redirectUrl)
        return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin))
      }
    }

    // If there's no code or session, redirect to login
    return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
  } catch (error) {
    console.error('Error in auth callback:', error)
    return NextResponse.redirect(
      new URL('/auth/login?error=Something+went+wrong+during+sign+in', request.url)
    )
  }
}
