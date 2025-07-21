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

const getInitials = (name: string): string => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part?.[0] || "")
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

const UserMenu = ({ user, profile, handleSignOut, isMobile }: any) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
        <Avatar className="h-8 w-8">
          <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} />
          <AvatarFallback>{getInitials(profile?.full_name || "")}</AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-56" align="end" forceMount>
      <DropdownMenuLabel className="font-normal">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{profile?.full_name || user?.email}</p>
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
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
        <LogOut className="mr-2 h-4 w-4" />
        <span>Log out</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const MobileHeader = ({ user, profile, handleSignOut }: any) => (
  <div className="flex items-center justify-between w-full">
    <UserMenu user={user} profile={profile} handleSignOut={handleSignOut} isMobile={true} />
    <Link href="/" className="flex-grow text-center">
      <Image
        src="/safetyshaper_logo.png"
        alt="Safety Shaper Logo"
        width={65}
        height={30}
        className="mx-auto h-8 w-auto"
        priority
      />
    </Link>
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" asChild>
        <Link href="/search">
          <Search className="h-5 w-5" />
        </Link>
      </Button>
      <Button variant="ghost" size="icon" asChild>
        <Link href="/messages">
          <MessageCircle className="h-5 w-5" />
        </Link>
      </Button>
      <Button variant="ghost" size="icon" asChild>
        <Link href="/notifications">
          <Bell className="h-5 w-5" />
        </Link>
      </Button>
    </div>
  </div>
);

const DesktopHeader = ({ user, profile, handleSignOut }: any) => (
  <div className="flex items-center justify-between w-full">
    <div className="flex items-center gap-4">
      <Link href="/" className="flex items-center" prefetch={true}>
        <Image
          src="/safetyshaper_logo.png"
          alt="Safety Shaper Logo"
          width={65}
          height={30}
          className="mr-2 h-8 w-auto"
          priority
        />
      </Link>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link href="/feed" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>Home</NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/knowledge" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Knowledge Hub
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/learning" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>Learning</NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/articles" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>Articles</NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>

    <div className="flex items-center gap-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-[300px] pl-8 rounded-full bg-muted/70"
        />
      </div>
      <UserMenu user={user} profile={profile} handleSignOut={handleSignOut} />
    </div>
  </div>
);

export const Navbar = memo(function Navbar() {
  const router = useRouter();
  const { toast } = useToast();
  const isMobile = useMobile();
  const { session, profile } = useAuth();
  const user = session?.user;

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out successfully" });
    router.push("/");
  }, [router, toast]);

  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="container flex h-16 items-center">
        {session ? (
          isMobile ? (
            <MobileHeader user={user} profile={profile} handleSignOut={handleSignOut} />
          ) : (
            <DesktopHeader user={user} profile={profile} handleSignOut={handleSignOut} />
          )
        ) : (
          <div className="flex items-center justify-between w-full">
            <Link href="/" className="flex items-center">
              <Image
                src="/safetyshaper_logo.png"
                alt="Safety Shaper Logo"
                width={65}
                height={30}
                className="mr-2 h-8 w-auto"
                priority
              />
            </Link>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/login?tab=register">Sign Up</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
});
