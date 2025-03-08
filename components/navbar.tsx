"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { Bell, MessageCircle, Search, Settings, Users, Briefcase, BookOpen, Shield, User, LogOut, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/contexts/auth-context"

export function Navbar() {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const isMobile = useMobile()

  const handleSignOut = async () => {
    try {
      // Call the server-side signout API
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Signed out successfully",
        })

        // Use replace to completely reset navigation history
        router.replace('/')
      } else {
        throw new Error('Sign out failed')
      }
    } catch (error) {
      console.error('Sign out error:', error)
      toast({
        title: "Sign out failed",
        variant: "destructive"
      })
    }
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(part => part?.[0] || '')
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const getUserName = () => {
    if (!user) return 'User'
    return user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <Image 
              src="/sslogo.webp" 
              alt="Safety Shaper Logo" 
              width={55}
              height={55}
              className="mr-2 h-9 w-9 transition-transform hover:scale-105"
              style={{ width: 'auto'}}
              priority
            />
          </Link>

          {user && !isMobile && (
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/feed" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>Home</NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/knowledge" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>Knowledge Hub</NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!isMobile && (
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-[200px] md:w-[300px] pl-8 rounded-full bg-muted/70 focus-visible:ring-primary transition-all focus-visible:bg-muted"
              />
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-4">
              {!isMobile && (
                <>
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger>
                          <Users className="h-5 w-5 mr-1" />
                          <span className="sr-only">Networks</span>
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="w-[300px] p-4">
                            <div className="mb-3 pb-2 border-b">
                              <h4 className="font-medium mb-1">Professional Network</h4>
                              <p className="text-xs text-muted-foreground">Connect with industry professionals</p>
                            </div>
                            <div className="grid gap-3">
                              <Link href="/network" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors">
                                <Users className="h-4 w-4 text-primary" />
                                <div>
                                  <div className="font-medium">My Connections</div>
                                  <p className="text-xs text-muted-foreground">Manage your professional network</p>
                                </div>
                              </Link>
                              <Link href="/network/professionals" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors">
                                <Search className="h-4 w-4 text-primary" />
                                <div>
                                  <div className="font-medium">Explore People</div>
                                  <p className="text-xs text-muted-foreground">Find ESG & EHS professionals</p>
                                </div>
                              </Link>
                              <Link href="/groups" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors">
                                <div className="relative">
                                  <Users className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <div className="font-medium">Groups</div>
                                  <p className="text-xs text-muted-foreground">Join specialized professional groups</p>
                                </div>
                              </Link>
                              <Link href="/events" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors">
                                <div className="relative">
                                  <Calendar className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <div className="font-medium">Events</div>
                                  <p className="text-xs text-muted-foreground">Discover industry events and conferences</p>
                                </div>
                              </Link>
                            </div>
                          </div>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                  <Link href="/jobs">
                    <Button variant="ghost" size="icon" aria-label="Jobs">
                      <Briefcase className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/messages">
                    <Button variant="ghost" size="icon" aria-label="Messages">
                      <MessageCircle className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/notifications">
                    <Button variant="ghost" size="icon" aria-label="Notifications">
                      <Bell className="h-5 w-5" />
                    </Button>
                  </Link>
                </>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "/placeholder-user.jpg"} 
                        alt={getUserName()}
                      />
                      <AvatarFallback>{getInitials(getUserName())}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{getUserName()}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
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
                    <DropdownMenuItem asChild>
                      <Link href="/compliance" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Compliance</span>
                      </Link>
                    </DropdownMenuItem>
                    {isMobile && (
                      <DropdownMenuItem asChild>
                        <Link href="/jobs" className="cursor-pointer">
                          <Briefcase className="mr-2 h-4 w-4" />
                          <span>Jobs</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {isMobile && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/messages" className="cursor-pointer">
                            <MessageCircle className="mr-2 h-4 w-4" />
                            <span>Messages</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/notifications" className="cursor-pointer">
                            <Bell className="mr-2 h-4 w-4" />
                            <span>Notifications</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div>
              {!isLoading && (
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
    </header>
  )
}