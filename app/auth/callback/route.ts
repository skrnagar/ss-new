
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // Default to feed if no redirectUrl specified
  const redirectTo = requestUrl.searchParams.get('redirectUrl') || '/feed'

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
    
    // Log the successful authentication
    console.log('Successfully authenticated user, redirecting to:', redirectTo)
  }

  // Redirect to destination with cache headers to prevent caching
  return NextResponse.redirect(new URL(redirectTo, request.url), {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}
