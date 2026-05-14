"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  Building,
  Calendar,
  LogOut,
  MessageCircle,
  Search,
  Settings,
  Shield,
  User,
  ClipboardCheck,
  Users,
  BookOpen,
  FileText,
  Plus,
  LayoutDashboard,
  Bot,
  GraduationCap,
  BarChart2,
  Leaf,
  Scale,
  Home,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { NotificationDropdown } from "@/components/notification-dropdown";
import { cn } from "@/lib/utils";

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
      <Button variant="ghost" className="relative h-10 w-10 shrink-0 rounded-full p-0">
        <Avatar className="h-10 w-10 ring-2 ring-border">
          <AvatarImage
            src={profile?.avatar_url || undefined}
            alt={profile?.full_name || "User"}
            className="object-cover"
          />
          <AvatarFallback className="text-xs font-semibold">
            {getInitials(profile?.full_name || "")}
          </AvatarFallback>
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
          <Link href="/feed" className="cursor-pointer">
            <Home className="mr-2 h-4 w-4" />
            <span>Feed</span>
          </Link>
        </DropdownMenuItem>
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
          <Link href="/companies/create" className="cursor-pointer">
            <Building className="mr-2 h-4 w-4" />
            <span>Create Company Page</span>
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
              <Link href="/safety-assistant" className="cursor-pointer">
                <Bot className="mr-2 h-4 w-4" />
                <span>Safety Assistant</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/insights" className="cursor-pointer">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Insights</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/learn" className="cursor-pointer">
                <GraduationCap className="mr-2 h-4 w-4" />
                <span>Training</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/compliance" className="cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                <span>Compliance</span>
              </Link>
            </DropdownMenuItem>
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
      
      // First, get all conversation IDs for this user
      const { data: userConversations, error: convError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("profile_id", user.id);
      
      if (convError) {
        console.error('Error fetching conversations:', convError);
        return;
      }
      
      if (!userConversations || userConversations.length === 0) {
        if (!ignore) setUnreadCount(0);
        return;
      }
      
      const conversationIds = userConversations.map(c => c.conversation_id);
      
      // Count unread messages directly
      const { count, error: countError } = await supabase
        .from("messages")
        .select("*", { count: 'exact', head: true })
        .in("conversation_id", conversationIds)
        .eq("seen", false)
        .neq("sender_id", user.id);
      
      if (countError) {
        console.error('Error counting unread messages:', countError);
        return;
      }
      
      if (!ignore) {
        setUnreadCount(count || 0);
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

function ConnectionRequestBadge() {
  const { session } = useAuth();
  const user = session?.user;
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    let ignore = false;
    
    async function fetchPendingRequests() {
      if (!user?.id || ignore) return;
      
      const { count, error } = await supabase
        .from("connections")
        .select("*", { count: 'exact', head: true })
        .eq("connected_user_id", user.id)
        .eq("status", "pending");
      
      if (error) {
        console.error('Error fetching pending connections:', error);
        return;
      }
      
      if (!ignore) {
        setPendingCount(count || 0);
      }
    }
    
    fetchPendingRequests();
    
    // Set up real-time subscription for connection changes
    const channel = supabase
      .channel(`connections_badge_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
        },
        () => {
          fetchPendingRequests();
        }
      )
      .subscribe();
    
    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  if (pendingCount === 0) {
    return <Users className="h-5 w-5" />;
  }

  return (
    <span className="relative">
      <Users className="h-5 w-5" />
      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5 flex items-center justify-center min-w-[20px] min-h-[20px]">
        {pendingCount > 99 ? "99+" : pendingCount}
      </span>
    </span>
  );
}

const MobileHeader = ({ user, profile, handleSignOut }: any) => (
  <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
    <div className="flex items-center justify-between gap-2 sm:contents">
      <Link href="/feed" className="flex shrink-0 items-center" prefetch={true} title="Feed">
        <Image
          src="/safetyshaper_logo.png"
          alt="Safety Shaper Logo"
          width={150}
          height={42}
          className="h-9 w-auto max-h-9 object-contain object-left"
          priority
        />
      </Link>
      <div className="flex shrink-0 items-center gap-1 sm:hidden">
        <NotificationDropdown userId={user?.id} />
        <UserMenu user={user} profile={profile} handleSignOut={handleSignOut} isMobile={true} />
      </div>
    </div>
    <div className="min-w-0 w-full sm:max-w-md sm:flex-1 sm:mx-2">
      <MobileSearch />
    </div>
    <div className="hidden shrink-0 items-center gap-2 sm:flex">
      <NotificationDropdown userId={user?.id} />
      <UserMenu user={user} profile={profile} handleSignOut={handleSignOut} isMobile={true} />
    </div>
  </div>
);

const DesktopHeader = ({ user, profile, handleSignOut }: any) => {
  const pathname = usePathname() || "";
  const feedActive = pathname === "/feed" || pathname.startsWith("/feed/");
  const discoverActive =
    pathname.startsWith("/knowledge") ||
    pathname.startsWith("/articles") ||
    pathname.startsWith("/companies");

  return (
    <div className="flex w-full flex-col gap-2 py-1 lg:flex-row lg:items-center lg:gap-4 lg:py-0">
      {/* Row 1 (lg: left): logo + primary nav — never flex-grow so search cannot overlap */}
      <div className="flex min-w-0 flex-wrap items-center gap-2 lg:max-w-[min(100%,28rem)] xl:max-w-none">
        <Link href="/feed" className="flex shrink-0 items-center" prefetch={true} title="Go to Feed">
          <Image
            src="/safetyshaper_logo.png"
            alt="Safety Shaper Logo"
            width={160}
            height={44}
            className="mr-1 h-9 w-auto max-h-9 object-contain object-left sm:mr-2 sm:h-10 sm:max-h-10"
            priority
          />
        </Link>
        <NavigationMenu className="flex-none max-w-max justify-start">
          <NavigationMenuList className="flex-wrap justify-start gap-0 space-x-0 sm:space-x-1">
          <NavigationMenuItem>
            <Link href="/feed" legacyBehavior passHref>
              <NavigationMenuLink
                className={cn(
                  navigationMenuTriggerStyle(),
                  feedActive && "bg-accent text-accent-foreground"
                )}
              >
                Feed
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger
              className={cn(discoverActive && "bg-accent text-accent-foreground")}
            >
              Discover
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-[280px] p-3">
                <p className="mb-2 px-2 text-xs text-muted-foreground">Content &amp; organizations</p>
                <div className="grid gap-1">
                  <Link
                    href="/knowledge"
                    className={cn(
                      "flex items-center gap-2 rounded-md p-2 hover:bg-muted",
                      pathname.startsWith("/knowledge") && "bg-muted"
                    )}
                  >
                    <BookOpen className="h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <div className="font-medium">Knowledge Hub</div>
                      <p className="text-xs text-muted-foreground">Resources &amp; guides</p>
                    </div>
                  </Link>
                  <Link
                    href="/articles"
                    className={cn(
                      "flex items-center gap-2 rounded-md p-2 hover:bg-muted",
                      pathname.startsWith("/articles") && "bg-muted"
                    )}
                  >
                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <div className="font-medium">Articles</div>
                      <p className="text-xs text-muted-foreground">Collaborative articles</p>
                    </div>
                  </Link>
                  <Link
                    href="/companies"
                    className={cn(
                      "flex items-center gap-2 rounded-md p-2 hover:bg-muted",
                      pathname.startsWith("/companies") && "bg-muted"
                    )}
                  >
                    <Building className="h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <div className="font-medium">Companies</div>
                      <p className="text-xs text-muted-foreground">Company pages</p>
                    </div>
                  </Link>
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      </div>

      {/* Search: own row on <lg desktop width; inline on large screens */}
      <div className="order-last min-w-0 w-full lg:order-none lg:flex-1 lg:px-2">
        <GlobalSearch />
      </div>

      {/* Tool icons */}
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1 sm:gap-2">
      <NavigationMenu className="flex-none max-w-max">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              <ConnectionRequestBadge />
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
                    href="/talent"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                  >
                    <Briefcase className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">Talent search</div>
                      <p className="text-xs text-muted-foreground">
                        Find candidates by skills &amp; visibility
                      </p>
                    </div>
                  </Link>

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

      <NavigationMenu className="flex-none max-w-max">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              <Briefcase className="h-5 w-5" />
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-[300px] p-4">
                <div className="mb-3 pb-2 border-b">
                  <h4 className="font-medium mb-1">Jobs</h4>
                  <p className="text-xs text-muted-foreground">
                    Find opportunities in ESG & EHS
                  </p>
                </div>
                <div className="grid gap-3">
                  <Link
                    href="/jobs/ehs-safety"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                  >
                    <Shield className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">EHS / Safety jobs</div>
                      <p className="text-xs text-muted-foreground">
                        Focused listings for safety &amp; compliance roles
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/jobs"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                  >
                    <Search className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">Browse Jobs</div>
                      <p className="text-xs text-muted-foreground">
                        Explore job opportunities
                      </p>
                    </div>
                  </Link>
                  
                  <Link
                    href="/jobs/my-jobs"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                  >
                    <FileText className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">My Jobs</div>
                      <p className="text-xs text-muted-foreground">
                        Applications & posted jobs
                      </p>
                    </div>
                  </Link>
                  
                  <Link
                    href="/jobs/post"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                  >
                    <Plus className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">Post a Job</div>
                      <p className="text-xs text-muted-foreground">
                        Hire qualified professionals
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <NavigationMenu className="flex-none max-w-max">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              <ClipboardCheck className="h-5 w-5" />
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-[300px] p-4">
                <div className="mb-3 pb-2 border-b">
                  <h4 className="font-medium mb-1">Audits</h4>
                  <p className="text-xs text-muted-foreground">Verified auditors, bookings &amp; evidence</p>
                </div>
                <div className="grid gap-3">
                  <Link
                    href="/audits"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                  >
                    <ClipboardCheck className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">Overview</div>
                      <p className="text-xs text-muted-foreground">How digital audits work</p>
                    </div>
                  </Link>
                  <Link
                    href="/audits/find"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                  >
                    <Shield className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">Find auditors</div>
                      <p className="text-xs text-muted-foreground">Map + nearby search</p>
                    </div>
                  </Link>
                  <Link
                    href="/audits/my-bookings"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                  >
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">My audit bookings</div>
                    </div>
                  </Link>
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <NavigationMenu className="flex-none max-w-max">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              <LayoutDashboard className="h-5 w-5" />
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-[300px] p-4">
                <div className="mb-3 pb-2 border-b">
                  <h4 className="font-medium mb-1">Insights</h4>
                  <p className="text-xs text-muted-foreground">Dashboards, ESG, and compliance</p>
                </div>
                <div className="grid gap-3">
                  <Link
                    href="/insights"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                  >
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">Overview</div>
                      <p className="text-xs text-muted-foreground">Hub for analytics areas</p>
                    </div>
                  </Link>
                  <Link
                    href="/insights/operations"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                  >
                    <BarChart2 className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">Operations</div>
                      <p className="text-xs text-muted-foreground">KPIs and incident trends</p>
                    </div>
                  </Link>
                  <Link
                    href="/insights/esg"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                  >
                    <Leaf className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">ESG metrics</div>
                      <p className="text-xs text-muted-foreground">Monthly ESG data entry</p>
                    </div>
                  </Link>
                  <Link
                    href="/safety-assistant"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                  >
                    <Bot className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">Safety Assistant</div>
                      <p className="text-xs text-muted-foreground">AI Q&amp;A for EHS &amp; ESG</p>
                    </div>
                  </Link>
                  <Link
                    href="/compliance"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                  >
                    <Scale className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">Compliance tracker</div>
                      <p className="text-xs text-muted-foreground">Obligations and evidence</p>
                    </div>
                  </Link>
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <NavigationMenu className="flex-none max-w-max">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              <GraduationCap className="h-5 w-5" />
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-[300px] p-4">
                <div className="mb-3 pb-2 border-b">
                  <h4 className="font-medium mb-1">Training</h4>
                  <p className="text-xs text-muted-foreground">Courses, quizzes, and certificates</p>
                </div>
                <div className="grid gap-3">
                  <Link
                    href="/learn"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                  >
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">Training hub</div>
                      <p className="text-xs text-muted-foreground">LMS overview</p>
                    </div>
                  </Link>
                  <Link
                    href="/learn/courses"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                  >
                    <BookOpen className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">Course catalog</div>
                      <p className="text-xs text-muted-foreground">Published courses</p>
                    </div>
                  </Link>
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

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
};

function NavbarAuthSkeleton() {
  return (
    <div className="flex w-full items-center justify-between gap-3 py-2 lg:h-16 lg:py-0" aria-busy="true" aria-label="Loading navigation">
      <Skeleton className="h-10 w-40 shrink-0 rounded-md" />
      <div className="flex flex-1 items-center justify-end gap-2 pl-4">
        <Skeleton className="hidden h-10 flex-1 max-w-md rounded-md lg:block" />
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      </div>
    </div>
  );
}

export const Navbar = memo(function Navbar() {
  const router = useRouter();
  const { toast } = useToast();
  const isLgDown = useMobile(1023);
  const { session, profile, isLoading } = useAuth();
  const user = session?.user;

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out successfully" });
    router.replace("/auth/login");
    router.refresh();
  }, [router, toast]);

  return (
    <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
      <div className="container flex min-h-14 flex-col justify-center px-4 sm:px-6 lg:h-16 lg:flex-row lg:items-center">
        {isLoading ? (
          <NavbarAuthSkeleton />
        ) : session ? (
          isLgDown ? (
            <MobileHeader user={user} profile={profile} handleSignOut={handleSignOut} />
          ) : (
            <DesktopHeader user={user} profile={profile} handleSignOut={handleSignOut} />
          )
        ) : (
          <div className="flex w-full items-center justify-between py-2 lg:h-16 lg:py-0">
            <Link href="/" className="flex items-center" prefetch={true}>
              <Image
                src="/safetyshaper_logo.png"
                alt="Safety Shaper Logo"
                width={160}
                height={44}
                className="mr-2 h-10 w-auto max-h-10 object-contain object-left"
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
