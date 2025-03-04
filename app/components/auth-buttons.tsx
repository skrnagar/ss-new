"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function AuthButtons() {
  const router = useRouter()

  return (
    <div className="flex flex-wrap gap-4">
      <Button 
        onClick={() => router.push('/auth/login')} 
        variant="outline" 
        className="bg-white text-primary hover:bg-white/90"
      >
        Sign In
      </Button>
      <Button 
        onClick={() => router.push('/auth/login?tab=register')} 
        className="bg-secondary hover:bg-secondary/90"
      >
        Join Now
      </Button>
    </div>
  )
}