
"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // The actual auth handling is done in the route.ts file
    // This page just provides a user-friendly loading experience
    const redirectTo = searchParams.get('redirectTo') || '/feed'
    
    // Add a brief delay to ensure the server-side auth completes
    const timer = setTimeout(() => {
      router.push(redirectTo)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [router, searchParams])
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <img src="/placeholder-logo.svg" alt="Safety Shaper Logo" className="h-16 w-16 mb-8" />
      <h1 className="text-2xl font-semibold mb-2">Signing you in</h1>
      <p className="text-muted-foreground mb-8">Please wait while we complete the authentication process...</p>
      <div className="h-2 w-64 bg-muted overflow-hidden rounded-full">
        <div className="h-full bg-primary animate-pulse rounded-full"></div>
      </div>
    </div>
  )
}
