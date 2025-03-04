
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
