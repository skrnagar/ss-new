
"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function FooterCTA() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user || null)
      } finally {
        setLoading(false)
      }
    }
    
    getUser()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
      }
    )
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white" disabled>
        Loading...
      </Button>
    )
  }

  if (user) {
    return (
      <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white" asChild>
        <Link href="/feed">Go to Your Dashboard</Link>
      </Button>
    )
  }

  return (
    <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white" asChild>
      <Link href="/auth/login?tab=register">Join Safety Shaper Today</Link>
    </Button>
  )
}
