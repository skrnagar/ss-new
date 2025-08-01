"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { ChatInterface } from "./chat/chat-interface";

export function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { profile, session } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Don't render if user is not authenticated
  if (!session || !profile) {
    return null;
  }

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part?.[0] || "")
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Fetch unread message count - using same approach as mobile nav
  useEffect(() => {
    if (!profile?.id) return;
    let ignore = false;

    const fetchUnreadCount = async () => {
      try {
        const { data, error } = await supabase
          .from("conversation_participants")
          .select(`conversation:conversations!inner(id, messages(seen, sender_id))`)
          .eq("profile_id", profile.id);

        if (!ignore && data) {
          let count = 0;
          data.forEach((item: any) => {
            const messages = item.conversation?.messages || [];
            count += messages.filter((m: any) => !m.seen && m.sender_id !== profile.id).length;
          });
          setUnreadCount(count);
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnreadCount();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("chat_panel_messages_badge")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, fetchUnreadCount)
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  return (
    <>
      {/* Chat Toggle Button - Desktop Only */}
      {!isOpen && (
        <div className="fixed bottom-8 right-8 z-50 hidden md:block">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-auto px-6 py-4 rounded-xl shadow-lg bg-white hover:bg-gray-50 border border-gray-200 flex items-center gap-4 relative"
          >
            {/* Chat Icon with Badge */}
            <div className="relative">
              <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {/* Unread Message Badge */}
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 py-2 px-2 rounded-md bg-red-500 text-white text-xs font-semibold min-w-[20px] h-[20px] flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </div>
              )}
            </div>
            
            {/* Messages Text */}
            <span className="text-gray-900 font-semibold text-sm">Messages</span>
            
            {/* Profile Pictures */}
            <div className="flex -space-x-2">
              <Avatar className="h-8 w-8 border-2 border-white">
                <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} />
                <AvatarFallback className="text-xs font-semibold bg-gray-200">
                  {getInitials(profile?.full_name || "")}
                </AvatarFallback>
              </Avatar>
              <Avatar className="h-8 w-8 border-2 border-white">
                <AvatarImage src="/placeholder-avatar-1.jpg" alt="User 2" />
                <AvatarFallback className="text-xs font-semibold bg-blue-200">JD</AvatarFallback>
              </Avatar>
              <Avatar className="h-8 w-8 border-2 border-white">
                <AvatarImage src="/placeholder-avatar-2.jpg" alt="User 3" />
                <AvatarFallback className="text-xs font-semibold bg-green-200">SM</AvatarFallback>
              </Avatar>
            </div>
            
            {/* Ellipsis Icon */}
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </Button>
        </div>
      )}

      {/* Desktop Chat Panel - Mobile-like Behavior */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 hidden md:block max-w-[calc(100vw-2rem)]">
          <Card className="w-80 lg:w-96 xl:w-[32rem] max-w-[calc(100vw-2rem)] h-[600px] lg:h-[700px] xl:h-[800px] max-h-[calc(100vh-2rem)] shadow-2xl border-0 rounded-xl overflow-hidden">
            {/* Chat Content - Mobile-like Interface */}
            <CardContent className="p-0 h-full">
              <ChatInterface onBack={() => setIsOpen(false)} />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
} 