
"use client"

import { useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import Image from 'next/image'

function CallbackContent() {
  const router = useRouter()
  const searchParams = new URLSearchParams(window.location.search)

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
      <Image src="/placeholder-logo.svg" alt="Safety Shaper Logo" width={64} height={64} className="h-16 w-16 mb-8" />
      <h1 className="text-2xl font-semibold mb-2">Signing you in</h1>
      <p className="text-muted-foreground mb-8">Please wait while we complete the authentication process...</p>
      <div className="h-2 w-64 bg-muted overflow-hidden rounded-full">
        <div className="h-full bg-primary animate-pulse rounded-full"></div>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Image src="/placeholder-logo.svg" alt="Safety Shaper Logo" width={64} height={64} className="h-16 w-16 mb-8" />
        <h1 className="text-2xl font-semibold mb-2">Loading...</h1>
        <div className="h-2 w-64 bg-muted overflow-hidden rounded-full">
          <div className="h-full bg-primary animate-pulse rounded-full"></div>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}
