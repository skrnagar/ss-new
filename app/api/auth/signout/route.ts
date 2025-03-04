
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  
  // Sign out on the server-side
  await supabase.auth.signOut()
  
  return NextResponse.json({ success: true }, { status: 200 })
}

export async function GET(request: Request) {
  // Sometimes clients might use GET instead of POST
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  
  await supabase.auth.signOut()
  
  return NextResponse.redirect(new URL('/auth/login', request.url))
}
