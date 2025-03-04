
"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AuthButtons() {
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
      <div className="flex flex-col sm:flex-row gap-4">
        <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white" disabled>
          Loading...
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="bg-transparent text-white border-white hover:bg-white/10"
          asChild
        >
          <Link href="#core-modules">Learn More</Link>
        </Button>
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex flex-col sm:flex-row gap-4">
        <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white" asChild>
          <Link href="/feed">Go to Dashboard</Link>
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="bg-transparent text-white border-white hover:bg-white/10"
          asChild
        >
          <Link href="#core-modules">Learn More</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white" asChild>
        <Link href="/auth/login?tab=register">Join Now</Link>
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="bg-transparent text-white border-white hover:bg-white/10"
        asChild
      >
        <Link href="#core-modules">Learn More</Link>
      </Button>
    </div>
  )
}
