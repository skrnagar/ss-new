
"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Github, Linkedin } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export function HeroAuthButtons() {
  const router = useRouter()
  const { toast } = useToast()

  async function signInWithGithub() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  async function signInWithLinkedIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={signInWithGithub}
        >
          <Github className="mr-2 h-4 w-4" />
          GitHub
        </Button>
        <Button 
          variant="outline"
          className="w-full"
          onClick={signInWithLinkedIn}
        >
          <Linkedin className="mr-2 h-4 w-4" />
          LinkedIn
        </Button>
      </div>
    </div>
  )
}
