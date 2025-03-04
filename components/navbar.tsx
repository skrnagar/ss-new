"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Bell, MessageSquare, ChevronDown, LogOut, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabase"
import { useMobile } from "@/hooks/use-mobile"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const isMobile = useMobile()
  const { toast } = useToast()
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user || null)
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    // Subscribe to auth changes - create a subscription only if supabase is defined
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed in navbar:', event, session?.user)
        if (event === 'SIGNED_IN') {
          setUser(session?.user || null)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          router.push('/')
        } else if (event === 'INITIAL_SESSION') {
          setUser(session?.user || null)
        }
      }
    ) || { data: {} }

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      })
      // No need to redirect here, middleware will handle it
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const isActive = (path) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  const navLinks = [
    { href: "/feed", label: "Feed" },
    { href: "/network", label: "Network" },
    { href: "/jobs", label: "Jobs" },
    { href: "/groups", label: "Groups" },
    { href: "/knowledge", label: "Knowledge" },
    { href: "/compliance", label: "Compliance" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-8 lg:gap-10">
          <Link className="flex items-center space-x-2" href="/">
            <img src="/placeholder-logo.svg" alt="Safety Shaper Logo" width={32} height={32} />
            <span className="hidden font-bold sm:inline-block">Safety Shaper</span>
          </Link>

          <nav className="hidden md:flex gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.href) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
        >
          <span className="sr-only">Open main menu</span>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {!loading && (
            <div>
              {user ? (
                <div className="flex items-center gap-4">
                  <Link href="/messages" className="relative">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      3
                    </span>
                  </Link>
                  <Link href="/notifications" className="relative">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      5
                    </span>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="p-1 h-8">
                        <div className="flex items-center gap-2">
                          <img
                            src={user.user_metadata?.avatar_url || user.user_metadata?.picture || "/placeholder-user.jpg"}
                            alt={user.user_metadata?.full_name || user.user_metadata?.name || "User"}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <span className="hidden xl:inline-block text-sm font-medium">
                            {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "User"}
                          </span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/auth/login?tab=register">Join Now</Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`absolute top-16 left-0 right-0 bg-background border-b transform ${
          isMenuOpen ? "translate-y-0" : "-translate-y-full"
        } transition-transform duration-300 ease-in-out md:hidden`}
      >
        <div className="space-y-1 px-4 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(link.href)
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-muted hover:text-primary"
              }`}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}

          {!loading && (
            <div>
              {user ? (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center px-3 py-2">
                    <img
                      src={user.user_metadata?.avatar_url || user.user_metadata?.picture || "/placeholder-user.jpg"}
                      alt={user.user_metadata?.full_name || user.user_metadata?.name || "User"}
                      className="h-8 w-8 rounded-full mr-2"
                    />
                    <span className="text-sm font-medium">
                      {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "User"}
                    </span>
                  </div>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted hover:text-primary"
                    onClick={closeMenu}
                  >
                    <User className="inline-block mr-2 h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted hover:text-primary"
                    onClick={closeMenu}
                  >
                    <Settings className="inline-block mr-2 h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut()
                      closeMenu()
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted hover:text-primary"
                  >
                    <LogOut className="inline-block mr-2 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2 px-3">
                  <Button asChild variant="outline" onClick={closeMenu} className="w-full">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button asChild onClick={closeMenu} className="w-full">
                    <Link href="/auth/login?tab=register">Join Now</Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}