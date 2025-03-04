"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

type ProtectedRouteProps = {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    let isMounted = true

    // Check auth immediately
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession()

        if (!isMounted) return

        if (!data.session) {
          router.push('/auth/login')
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        if (!isMounted) return
        console.error('Auth check failed:', error)
        setIsLoading(false)
        toast({
          title: "Authentication error",
          description: "Please try signing in again",
          variant: "destructive",
        })
        router.push('/auth/login')
      }
    }

    // Set up auth listener for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return

        if (event === 'SIGNED_OUT') {
          router.push('/auth/login')
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setIsLoading(false)
        }
      }
    )

    checkAuth()

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [router, toast])

  // Simplified loading indicator that won't delay content for long
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}