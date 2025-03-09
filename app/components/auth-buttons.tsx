"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function AuthButtons({ className }: { className?: string }) {
  const router = useRouter()

  return (
    <div className={cn(className)}>
      <Button 
        onClick={() => router.push('/auth/login')} 
        variant="outline" 
        className="bg-white py-6 w-full text-primary hover:bg-white/90"
      >
        Sign in with email
      </Button>
      {/* <Button 
        onClick={() => router.push('/auth/login?tab=register')} 
        className="bg-secondary hover:bg-secondary/90"
      >
        Join Now
      </Button> */}
    </div>
  )
}