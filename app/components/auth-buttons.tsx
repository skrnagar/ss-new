"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function AuthButtons() {
  const router = useRouter()

  return (
    <div className="w-full flex flex-col gap-3">
      <Button 
        onClick={() => router.push('/auth/login')} 
        variant="outline" 
        className="bg-white py-6 w-full text-primary hover:bg-white/90"
      >
        Sign in with email
      </Button>
      <Button 
        onClick={() => router.push('/auth/login?tab=register')} 
        className="bg-secondary hover:bg-secondary/90 py-6 w-full"
      >
        Join Now
      </Button>
    </div>
  )
}