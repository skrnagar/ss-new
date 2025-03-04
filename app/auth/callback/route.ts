
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")

  // For development, we'll mock the callback process
  // In a real implementation, this would exchange the code for a Supabase session
  
  // Mock setting a session cookie
  cookies().set("mockSession", "true", { 
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL("/feed", request.url))
}
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
    
    // Try to exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
    
    // Get redirect URL or default to feed
    const redirectTo = requestUrl.searchParams.get('redirectTo') || '/feed'
    
    // Redirect to the intended page
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  // If something went wrong, redirect to the login page
  return NextResponse.redirect(new URL('/auth/login', request.url))
}
