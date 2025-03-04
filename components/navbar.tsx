
"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  Briefcase, 
  BookOpen, 
  Users, 
  Bell, 
  MessageSquare, 
  Menu, 
  X, 
  Search,
  User,
  Settings,
  LogOut
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user || null)
        
        if (session?.user) {
          // Fetch user profile
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          setProfile(data)
        }
      } catch (error) {
        console.error('Error getting user:', error)
      } finally {
        setLoading(false)
      }
    }
    
    getUser()
    
    // Set up auth state change listener
    const authListener = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
        if (event === 'SIGNED_OUT') {
          setProfile(null)
        } else if (event === 'SIGNED_IN' && session) {
          // Fetch user profile after sign in
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => {
              setProfile(data)
            })
        }
      }
    )
    
    return () => {
      if (authListener?.data?.subscription) {
        authListener.data.subscription.unsubscribe()
      }
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast({
        title: "Signed out successfully",
      })
      router.push('/')
    } catch (error) {
      toast({
        title: "Sign out failed",
        variant: "destructive"
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const getUserName = () => {
    return user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded-full bg-primary p-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="hidden font-bold text-xl text-primary sm:inline-block">Safety Shaper</span>
          </Link>
        </div>

        <div className="hidden md:flex md:flex-1 md:items-center md:justify-center px-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search professionals, jobs, resources..." className="pl-8 w-full" />
          </div>
        </div>

        {!loading && (
          <>
            {user ? (
              <nav className="hidden md:flex items-center gap-5">
                <Link
                  href="/feed"
                  className="flex flex-col items-center text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </Link>
                <Link
                  href="/jobs"
                  className="flex flex-col items-center text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  <Briefcase className="h-5 w-5" />
                  <span>Jobs</span>
                </Link>
                <Link
                  href="/knowledge"
                  className="flex flex-col items-center text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Knowledge</span>
                </Link>
                <Link
                  href="/groups"
                  className="flex flex-col items-center text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  <Users className="h-5 w-5" />
                  <span>Groups</span>
                </Link>
                <Link
                  href="/notifications"
                  className="flex flex-col items-center text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </Link>
                <Link
                  href="/messages"
                  className="flex flex-col items-center text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Messages</span>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-full h-8 w-8 p-0">
                      <Avatar>
                        <AvatarImage 
                          src={user?.user_metadata?.avatar_url || '/placeholder-user.jpg'} 
                          alt={getUserName()} 
                        />
                        <AvatarFallback>{getInitials(getUserName())}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={profile?.username ? `/profile/${profile.username}` : '/profile'}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </nav>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="hidden md:flex">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button variant="secondary" asChild className="hidden md:flex">
                  <Link href="/auth/login?tab=register">Join Now</Link>
                </Button>
              </div>
            )}
          </>
        )}

        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4">
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search professionals, jobs, resources..." className="pl-8 w-full" />
            </div>
            
            {user ? (
              <>
                <div className="flex items-center gap-3 p-3 mb-3 bg-muted rounded-md">
                  <Avatar>
                    <AvatarImage 
                      src={user?.user_metadata?.avatar_url || '/placeholder-user.jpg'} 
                      alt={getUserName()} 
                    />
                    <AvatarFallback>{getInitials(getUserName())}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{getUserName()}</div>
                    <div className="text-sm text-muted-foreground">
                      {profile?.headline || user?.email}
                    </div>
                  </div>
                </div>

                <nav className="grid grid-cols-3 gap-4">
                  <Link
                    href="/feed"
                    className="flex flex-col items-center p-2 text-sm font-medium text-muted-foreground hover:text-primary"
                  >
                    <Home className="h-5 w-5 mb-1" />
                    <span>Home</span>
                  </Link>
                  <Link
                    href="/jobs"
                    className="flex flex-col items-center p-2 text-sm font-medium text-muted-foreground hover:text-primary"
                  >
                    <Briefcase className="h-5 w-5 mb-1" />
                    <span>Jobs</span>
                  </Link>
                  <Link
                    href="/knowledge"
                    className="flex flex-col items-center p-2 text-sm font-medium text-muted-foreground hover:text-primary"
                  >
                    <BookOpen className="h-5 w-5 mb-1" />
                    <span>Knowledge</span>
                  </Link>
                  <Link
                    href="/groups"
                    className="flex flex-col items-center p-2 text-sm font-medium text-muted-foreground hover:text-primary"
                  >
                    <Users className="h-5 w-5 mb-1" />
                    <span>Groups</span>
                  </Link>
                  <Link
                    href="/notifications"
                    className="flex flex-col items-center p-2 text-sm font-medium text-muted-foreground hover:text-primary"
                  >
                    <Bell className="h-5 w-5 mb-1" />
                    <span>Notifications</span>
                  </Link>
                  <Link
                    href="/messages"
                    className="flex flex-col items-center p-2 text-sm font-medium text-muted-foreground hover:text-primary"
                  >
                    <MessageSquare className="h-5 w-5 mb-1" />
                    <span>Messages</span>
                  </Link>
                </nav>
                
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link href={profile?.username ? `/profile/${profile.username}` : '/profile'}>
                    <Button variant="outline" className="w-full">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                  </Link>
                  <Link href="/settings">
                    <Button variant="outline" className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                  </Link>
                </div>
                
                <div className="mt-2">
                  <Button variant="secondary" onClick={handleSignOut} className="w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="mt-4 space-y-2">
                <Button asChild variant="default" className="w-full">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <Link href="/auth/login?tab=register">Join Now</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
