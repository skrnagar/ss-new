
"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type ProtectedRouteProps = {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    
    // Check for session only once when component mounts
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (mounted) {
          setSession(session)
          
          if (!session) {
            router.push('/auth/login')
          } else {
            setIsLoading(false)
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        if (mounted) {
          router.push('/auth/login')
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    checkSession()
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (mounted) {
          setSession(session)
          
          if (event === 'SIGNED_OUT' || !session) {
            router.push('/auth/login')
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [router])

  // Show loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If there's a session and not loading, render children
  return session ? <>{children}</> : null
}
