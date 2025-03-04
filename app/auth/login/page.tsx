'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState('/feed')

  useEffect(() => {
    // Get the redirectUrl from query parameters if available
    const params = new URLSearchParams(window.location.search)
    const redirectParam = params.get('redirectUrl')
    if (redirectParam) {
      setRedirectUrl(redirectParam)
    }

    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        console.log('User already authenticated, redirecting to:', redirectUrl)
        router.push(redirectUrl)
      }
    }

    checkAuth()
  }, [router, supabase, redirectUrl])

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      // Include the redirectUrl in the auth redirect so the callback can redirect properly
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectUrl=${encodeURIComponent(redirectUrl)}`
        }
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error signing in with Google:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">
            Welcome back
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Sign in to your account to continue
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-6 bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? 'Loading...' : 'Sign in with Google'}
          </Button>
        </div>
      </div>
    </div>
  )
}