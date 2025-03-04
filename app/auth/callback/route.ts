import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)

    // Get redirect URL or default to feed
    const redirectTo = requestUrl.searchParams.get('redirectTo') || '/feed'

    // Redirect to the intended page
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  // If no code is present, redirect to login page
  return NextResponse.redirect(new URL('/auth/login', request.url))
}