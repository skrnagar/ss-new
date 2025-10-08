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
import { GlobalSearch } from "@/components/global-search";
import { MobileSearch } from "@/components/mobile-search";
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
  BookOpen,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { NotificationDropdown } from "@/components/notification-dropdown";

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
      <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
        <Avatar className="h-8 w-8">
          <div className="h-full w-full rounded-full p-0.5 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
            <div className="h-full w-full rounded-full bg-white p-0.5">
              <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} className="object-cover rounded-full" />
              <AvatarFallback className="rounded-full">{getInitials(profile?.full_name || "")}</AvatarFallback>
            </div>
          </div>
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
        {!isMobile && (
          <DropdownMenuItem asChild>
            <Link href="/compliance" className="cursor-pointer">
              <Shield className="mr-2 h-4 w-4" />
              <span>Compliance</span>
            </Link>
          </DropdownMenuItem>
        )}
        {isMobile && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/articles" className="cursor-pointer">
                <BookOpen className="mr-2 h-4 w-4" />
                <span>Articles</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/jobs" className="cursor-pointer">
                <Briefcase className="mr-2 h-4 w-4" />
                <span>Jobs</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/messages" className="cursor-pointer">
                <MessageCircle className="mr-2 h-4 w-4" />
                <span>Messages</span>
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
);

function MessageBadge() {
  const { session } = useAuth();
  const user = session?.user;
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    let ignore = false;
    
    async function fetchUnread() {
      if (!user?.id || ignore) return;
      
      const { data, error } = await supabase
        .from("conversation_participants")
        .select(`conversation:conversations!inner(id, messages(seen, sender_id))`)
        .eq("profile_id", user.id);
      
      if (error) {
        console.error('Error fetching unread count:', error);
        return;
      }
      
      if (!ignore && data) {
        let count = 0;
        data.forEach((item: any) => {
          const messages = item.conversation?.messages || [];
          count += messages.filter((m: any) => !m.seen && m.sender_id !== user.id).length;
        });
        setUnreadCount(count);
      }
    }
    
    fetchUnread();
    
    // Set up real-time subscription with proper configuration
    const channel = supabase
      .channel(`messages_badge_${user.id}`, {
        config: {
          broadcast: { self: false },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchUnread();
        }
      )
      .subscribe();
    
    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return (
    <span className="relative">
      <MessageCircle className="h-5 w-5" aria-label="Messages" />
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5 flex items-center justify-center min-w-[20px] min-h-[20px]">
          {unreadCount}
        </span>
      )}
    </span>
  );
}

const MobileHeader = ({ user, profile, handleSignOut }: any) => (
  <div className="flex items-center justify-between w-full gap-3 px-4 py-2">
    <Link href="/" className="flex items-center flex-shrink-0" prefetch={true}>
      <Image
        src="/safetyshaper_logo.png"
        alt="Safety Shaper Logo"
        width={60}
        height={28}
        className="h-7 w-auto"
        priority
      />
    </Link>
    <div className="flex-1 min-w-0 max-w-[200px] sm:max-w-[240px] mx-2">
      <MobileSearch />
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      <NotificationDropdown userId={user?.id} />
      <UserMenu user={user} profile={profile} handleSignOut={handleSignOut} isMobile={true} />
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

    <div className="flex items-center gap-2">
      <GlobalSearch />

      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              <Users className="h-5 w-5" />
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
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
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
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                  >
                    <Users className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">Explore People</div>
                      <p className="text-xs text-muted-foreground">
                        Find ESG & EHS professionals
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="/groups"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                  >
                    <Users className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">Groups</div>
                      <p className="text-xs text-muted-foreground">
                        Join specialized professional groups
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="/events"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                  >
                    <Calendar className="h-4 w-4 text-primary" />
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

      <Button variant="ghost" size="icon" asChild>
        <Link href="/jobs">
          <Briefcase className="h-5 w-5" />
        </Link>
      </Button>
      <Button variant="ghost" size="icon" asChild>
        <Link href="/messages">
          <MessageBadge />
        </Link>
      </Button>
      <NotificationDropdown userId={user?.id} />
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
