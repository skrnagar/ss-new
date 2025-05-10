"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/contexts/auth-context";
import { useMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  Briefcase,
  Calendar,
  LogOut,
  MessageCircle,
  Search,
  Settings,
  Shield,
  User,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// Memoize the Navbar component to prevent unnecessary re-renders
export const Navbar = memo(function Navbar() {
  const router = useRouter();
  const { toast } = useToast();
  const isMobile = useMobile();
  const { user, isLoading } = useAuth();

  // Memoize handler functions to prevent recreation on every render
  const handleSignOut = useCallback(async () => {
    try {
      // Call server endpoint first to clear cookies
      const response = await fetch("/api/auth/signout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Server sign out failed");
      }

      // Then sign out from Supabase client
      await supabase.auth.signOut();

      toast({
        title: "Signed out successfully",
      });

      // Force page reload to clear all client state
      window.location.href = "/";

    } catch (error) {
      console.error("Sign out error:", error);
      // Still redirect on error to ensure user is logged out
      window.location.href = "/";
    }
  }, [toast]);

  const getInitials = useCallback((name: string): string => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part?.[0] || "")
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }, []);

  const getUserName = useCallback(() => {
    if (!user) return "User";
    return user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  }, [user]);

  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center" prefetch={true}>
            <Image
              src="/safetyshaper_logo.png"
              alt="Safety Shaper Logo"
              width={65}
              height={30}
              className="mr-2 h-8 w-8 transition-transform hover:scale-105"
              style={{ width: "auto", height: "auto" }}
              priority
            />
          </Link>

          {user && !isMobile && (
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/feed" legacyBehavior passHref prefetch={true}>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Home
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/knowledge" legacyBehavior passHref prefetch={true}>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Knowledge Hub
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/learning" legacyBehavior passHref prefetch={true}>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Learning
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/articles" legacyBehavior passHref prefetch={true}>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Articles
                    </NavigationMenuLink>
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
                              <p className="text-xs text-muted-foreground">
                                Connect with industry professionals
                              </p>
                            </div>
                            <div className="grid gap-3">
                              <Link
                                href="/network"
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
                              >
                                <Users className="h-4 w-4 text-primary" />
                                <div>
                                  <div className="font-medium">My Connections</div>
                                  <p className="text-xs text-muted-foreground">
                                    Manage your professional network
                                  </p>
                                </div>
                              </Link>
                              <Link
                                href="/network/professionals"
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
                              >
                                <Search className="h-4 w-4 text-primary" />
                                <div>
                                  <div className="font-medium">Explore People</div>
                                  <p className="text-xs text-muted-foreground">
                                    Find ESG & EHS professionals
                                  </p>
                                </div>
                              </Link>
                              <Link
                                href="/groups"
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
                              >
                                <div className="relative">
                                  <Users className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <div className="font-medium">Groups</div>
                                  <p className="text-xs text-muted-foreground">
                                    Join specialized professional groups
                                  </p>
                                </div>
                              </Link>
                              <Link
                                href="/events"
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
                              >
                                <div className="relative">
                                  <Calendar className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <div className="font-medium">Events</div>
                                  <p className="text-xs text-muted-foreground">
                                    Discover industry events and conferences
                                  </p>
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
                    <Button variant="ghost" size="icon" aria-label="Messages" className="relative">
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
                  <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full">
                    <Avatar className="h-8 w-8 md:h-10 md:w-10">
                      <AvatarImage
                        src={user?.profile?.avatar_url || user?.user_metadata?.avatar_url || ""}
                        alt={user?.profile?.full_name || user?.user_metadata?.full_name || "User"}
                      />
                      <AvatarFallback>
                        {getInitials(user?.profile?.full_name || user?.user_metadata?.full_name || "")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.profile?.full_name || user?.user_metadata?.full_name || getUserName()}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      {user?.profile?.headline && (
                        <p className="text-xs leading-none text-muted-foreground mt-1">{user.profile.headline}</p>
                      )}
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

                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" className="bg-white text-black ">
                    <Link href="/auth/login">Log in</Link>
                  </Button>
                  <Button asChild className="bg-primary text-white hover:bg-primary/90">
                    <Link href="/auth/register">Sign Up</Link>
                  </Button>
                </div>

            </div>
          )}
        </div>
      </div>
    </header>
  );
});