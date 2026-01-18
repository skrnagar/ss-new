"use client";

import { useAdmin } from "@/contexts/admin-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, LogOut, User, Settings, Bell, Search, Menu, AlertCircle, Activity, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function AdminGlobalHeader() {
  const { admin, logout } = useAdmin();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const isSetupPage = pathname === "/admin/setup";
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);

  const getInitials = (name: string): string => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((part) => part?.[0] || "")
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Don't show header on login/setup pages
  if (isLoginPage || isSetupPage) {
    return null;
  }

  const isSuperAdmin = admin?.role === "super_admin";

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);

  useEffect(() => {
    if (!isLoginPage && !isSetupPage) {
      fetchNotifications();
      // Refresh notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoginPage, isSetupPage, fetchNotifications]);

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults(null);
      setIsSearchOpen(false);
      return;
    }

    try {
      const response = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results);
        setIsSearchOpen(true);
      }
    } catch (error) {
      console.error("Error searching:", error);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        setSearchResults(null);
        setIsSearchOpen(false);
      }
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Left: Logo */}
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold leading-none">Admin Dashboard</span>
              <span className="text-xs text-muted-foreground leading-none">Management Console</span>
            </div>
          </Link>
        </div>

        {/* Center: Search (hidden on mobile) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users, posts, jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && searchQuery.length >= 2 && setIsSearchOpen(true)}
              onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
              className="pl-10 h-9 w-full"
            />
            
            {/* Search Results Dropdown */}
            {isSearchOpen && searchResults && (
              <div className="absolute top-full mt-2 w-full bg-card border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-2">
                    {searchResults.users && searchResults.users.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs font-semibold text-muted-foreground px-2 py-1">Users</div>
                        {searchResults.users.map((user: any) => (
                          <Link
                            key={user.id}
                            href={`/admin/users`}
                            className="flex items-center gap-2 px-2 py-2 rounded hover:bg-muted cursor-pointer"
                            onClick={() => {
                              setSearchQuery("");
                              setIsSearchOpen(false);
                            }}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{user.full_name?.[0] || user.username?.[0] || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{user.full_name || user.username}</div>
                              <div className="text-xs text-muted-foreground truncate">@{user.username}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    
                    {searchResults.posts && searchResults.posts.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs font-semibold text-muted-foreground px-2 py-1">Posts</div>
                        {searchResults.posts.map((post: any) => (
                          <Link
                            key={post.id}
                            href={`/admin/posts`}
                            className="block px-2 py-2 rounded hover:bg-muted cursor-pointer"
                            onClick={() => {
                              setSearchQuery("");
                              setIsSearchOpen(false);
                            }}
                          >
                            <div className="text-sm truncate">{post.content?.substring(0, 60) || "Post"}</div>
                          </Link>
                        ))}
                      </div>
                    )}
                    
                    {searchResults.jobs && searchResults.jobs.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs font-semibold text-muted-foreground px-2 py-1">Jobs</div>
                        {searchResults.jobs.map((job: any) => (
                          <Link
                            key={job.id}
                            href={`/admin/jobs`}
                            className="block px-2 py-2 rounded hover:bg-muted cursor-pointer"
                            onClick={() => {
                              setSearchQuery("");
                              setIsSearchOpen(false);
                            }}
                          >
                            <div className="text-sm font-medium">{job.title}</div>
                            <div className="text-xs text-muted-foreground">{job.company_name}</div>
                          </Link>
                        ))}
                      </div>
                    )}
                    
                    {(!searchResults.users || searchResults.users.length === 0) &&
                     (!searchResults.posts || searchResults.posts.length === 0) &&
                     (!searchResults.jobs || searchResults.jobs.length === 0) && (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No results found
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">{unreadCount} new</Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ScrollArea className="h-[400px]">
                {notifications.length > 0 ? (
                  <div className="space-y-1">
                    {notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        asChild
                        className={cn("flex items-start gap-3 p-3 cursor-pointer", !notification.read && "bg-muted/50")}
                      >
                        <Link href={notification.link || "#"} onClick={fetchNotifications}>
                          <div className="mt-0.5">
                            {notification.type === "pending_approval" ? (
                              <AlertCircle className="h-4 w-4 text-orange-500" />
                            ) : (
                              <Activity className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-snug">{notification.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No new notifications
                  </div>
                )}
              </ScrollArea>
              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/activity" className="text-center justify-center">
                      View all activity
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          {admin ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 px-2 gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={admin.full_name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(admin.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium leading-none">{admin.full_name}</span>
                    <span className="text-xs text-muted-foreground leading-none capitalize">
                      {admin.role}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">{admin.full_name}</p>
                      {isSuperAdmin && (
                        <Badge variant="default" className="h-4 px-1.5 text-xs">
                          <Shield className="h-2.5 w-2.5 mr-0.5" />
                          Super
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs leading-none text-muted-foreground">{admin.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="cursor-pointer w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="cursor-pointer w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                {isSuperAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/admin-users" className="cursor-pointer w-full">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Users</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
