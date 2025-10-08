"use client";
import useSWR from 'swr';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Bell, UserPlus, UserCheck, UserMinus, ArrowRight, Heart, MessageSquare } from "lucide-react";

const notificationIcon = (type: string) => {
  switch (type) {
    case "connection_request":
      return <UserPlus className="h-5 w-5 text-blue-500 mr-3" />;
    case "connection_accepted":
      return <UserCheck className="h-5 w-5 text-green-500 mr-3" />;
    case "connection_withdrawn":
      return <UserMinus className="h-5 w-5 text-red-500 mr-3" />;
    case "new_follower":
      return <UserPlus className="h-5 w-5 text-purple-500 mr-3" />;
    case "post_like":
      return <Heart className="h-5 w-5 text-red-500 mr-3" />;
    case "post_comment":
      return <MessageSquare className="h-5 w-5 text-blue-500 mr-3" />;
    default:
      return <Bell className="h-5 w-5 text-gray-400 mr-3" />;
  }
};

const fetchNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

const NotificationItem = React.memo(function NotificationItem({ n, onRead }: { n: any, onRead: (id: string) => void }) {
  const getNotificationStyle = (type: string, read: boolean) => {
    if (read) return "opacity-60";
    
    switch (type) {
      case "post_like":
        return "bg-red-50 border-l-4 border-red-500 font-semibold";
      case "post_comment":
        return "bg-blue-50 border-l-4 border-blue-500 font-semibold";
      case "new_follower":
        return "bg-purple-50 border-l-4 border-purple-500 font-semibold";
      case "connection_request":
        return "bg-blue-50 border-l-4 border-blue-500 font-semibold";
      case "connection_accepted":
        return "bg-green-50 border-l-4 border-green-500 font-semibold";
      default:
        return "bg-blue-50 border-l-4 border-blue-500 font-semibold";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Link
      key={n.id}
      href={n.link || "/network/followers"}
      className={`flex items-center gap-4 px-6 py-5 transition hover:bg-muted/60 ${getNotificationStyle(n.type, n.read)} rounded-none sm:px-6 sm:py-5 px-3 py-4 text-base`}
      style={{ textDecoration: "none" }}
      aria-label={n.content}
      tabIndex={0}
      onClick={e => {
        if (!n.read) onRead(n.id);
      }}
      onKeyDown={e => {
        if ((e.key === 'Enter' || e.key === ' ') && !n.read) onRead(n.id);
      }}
    >
      {notificationIcon(n.type)}
      <div className="flex-1 min-w-0">
        <div className="text-base leading-tight line-clamp-2">{n.content}</div>
        <div className="text-xs text-muted-foreground mt-2">{formatTime(n.created_at)}</div>
      </div>
      <ArrowRight className="h-5 w-5 text-muted-foreground mt-1" />
    </Link>
  );
});

export function NotificationDropdown({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const { data: notifications = [], mutate } = useSWR(userId ? ["notifications", userId] : null, () => fetchNotifications(userId));
  const unreadCount = useMemo(() => notifications.filter((n: any) => !n.read).length, [notifications]);
  const paginated = useMemo(() => notifications.slice(0, page * PAGE_SIZE), [notifications, page]);

  // Real-time subscription for notifications
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications_${userId}`, {
        config: {
          broadcast: { self: false },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          mutate(); // Refresh notifications when there's a change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, mutate]);

  const markAllRead = useCallback(async () => {
    await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
    mutate();
  }, [userId, mutate]);

  const handleRead = useCallback(async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    mutate();
  }, [mutate]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Open notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5">{unreadCount}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[28rem] max-h-[36rem] overflow-auto p-0 shadow-2xl rounded-xl sm:w-[28rem] sm:max-h-[36rem] w-full max-w-[98vw] min-w-0 md:w-[28rem] md:max-h-[36rem]"
        style={{ minWidth: 0 }}
      >
        <DropdownMenuLabel className="flex justify-between items-center px-6 pt-6 pb-3 text-xl font-bold sm:px-6 sm:pt-6 sm:pb-3 px-4 pt-4 pb-2 text-lg">
          Notifications
          {unreadCount > 0 && (
            <Button size="sm" variant="link" onClick={markAllRead} className="ml-2">Mark all read</Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-lg sm:p-8 p-4 text-base">No notifications</div>
        ) : (
          <div className="divide-y">
            {paginated.map((n: any) => (
              <NotificationItem key={n.id} n={n} onRead={handleRead} />
            ))}
            {notifications.length > paginated.length && (
              <div className="flex justify-center py-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} aria-label="Show more notifications">Show more</Button>
              </div>
            )}
          </div>
        )}
        <DropdownMenuSeparator />
        <div className="flex justify-center p-4 sm:p-4 p-2">
          <Link href="/network/followers" className="text-primary font-semibold flex items-center gap-2 text-base hover:underline">
            View all notifications <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 