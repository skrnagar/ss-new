"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, MessageCircle, Search, Settings, Users, Briefcase, BookOpen, Shield, User, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useIsMobile } from "@/hooks/use-mobile"
import { supabase } from "@/lib/supabase"

export function Navbar() {
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const isMobile = useIsMobile()

  // Check if current path matches the given path
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/')
  }

  useEffect(() => {
    // Check for user session on component mount
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }

    checkUser()

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in navbar:", event, session?.user || null)
      setUser(session?.user || null)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      })
      router.push('/auth/login')
    } catch (error) {
      console.error('Error logging out:', error)
      toast({
        title: "Error signing out",
        description: "There was an issue signing you out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/feed" className="mr-6 flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              Safety Shaper
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {!isMobile && (
              <>
                <Link
                  href="/feed"
                  className={`transition-colors hover:text-foreground/80 ${isActive('/feed') ? 'text-foreground font-semibold' : 'text-foreground/60'}`}
                >
                  Feed
                </Link>
                <Link
                  href="/jobs"
                  className={`transition-colors hover:text-foreground/80 ${isActive('/jobs') ? 'text-foreground font-semibold' : 'text-foreground/60'}`}
                >
                  Jobs
                </Link>
                <Link
                  href="/groups"
                  className={`transition-colors hover:text-foreground/80 ${isActive('/groups') ? 'text-foreground font-semibold' : 'text-foreground/60'}`}
                >
                  Groups
                </Link>
                <Link
                  href="/knowledge"
                  className={`transition-colors hover:text-foreground/80 ${isActive('/knowledge') ? 'text-foreground font-semibold' : 'text-foreground/60'}`}
                >
                  Knowledge
                </Link>
              </>
            )}
          </nav>
        </div>

        {user ? (
          <>
            <div className="flex-1 ml-auto flex items-center justify-end space-x-2">
              {!isMobile && (
                <div className="w-full max-w-sm mr-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="pl-8 w-full rounded-full bg-muted"
                    />
                  </div>
                </div>
              )}
              <Link href="/messages">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <MessageCircle className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Bell className="h-5 w-5" />
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size={isMobile ? "icon" : "default"}
                    className="relative h-8 rounded-full"
                  >
                    {isMobile ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-primary/10 p-1">
                          <User className="h-4 w-4" />
                        </div>
                        <span>Profile</span>
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-end space-x-2">
            <Link href="/auth/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}