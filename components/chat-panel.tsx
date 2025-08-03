"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { useConversations } from "@/contexts/conversation-context";
import { ChatInterface } from "./chat/chat-interface";

export function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { profile, session } = useAuth();
  const { conversations } = useConversations();

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

  // Calculate unread count from conversations context
  const unreadCount = conversations.reduce((total, conversation) => {
    return total + (conversation.unreadCount || 0);
  }, 0);

  return (
    <>
      {/* Chat Toggle Button - Desktop Only */}
      {!isOpen && (
        <div className="fixed bottom-8 right-8 z-50 hidden md:block">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-auto px-6 py-4 rounded-xl backdrop-blur-[8px] bg-white/50 hover:bg-white/70 border border-gray-200 ring-2 ring-offset-2 ring-offset-background/70 ring-white/20 flex items-center gap-4 relative"
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
            <span className="text-gray-900 font-semibold text-sm drop-shadow-sm">Messages</span>
            
            {/* Profile Pictures - Show last 3 conversations or placeholders */}
            <div className="flex -space-x-2">
              {conversations.slice(0, 3).map((conversation, index) => {
                const participant = conversation.participants[0];
                return (
                  <Avatar key={conversation.id} className="h-8 w-8 border-2 border-white">
                    <AvatarImage src={participant?.avatar_url || ""} alt={participant?.full_name || "User"} />
                    <AvatarFallback className="text-xs font-semibold bg-gray-200">
                      {participant ? getInitials(participant.full_name) : `U${index + 1}`}
                    </AvatarFallback>
                  </Avatar>
                );
              })}
              {/* Fill remaining slots with placeholders if less than 3 conversations */}
              {Array.from({ length: Math.max(0, 3 - conversations.length) }).map((_, index) => (
                <Avatar key={`placeholder-${index}`} className="h-8 w-8 border-2 border-white">
                  <AvatarFallback className="text-xs font-semibold bg-gray-200">
                    {index === 0 ? "JD" : index === 1 ? "SM" : "AB"}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </Button>
        </div>
      )}

      {/* Desktop Chat Panel - Mobile-like Behavior */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 hidden md:block max-w-[calc(100vw-2rem)]">
          <Card className="w-80 lg:w-96 xl:w-[32rem] max-w-[calc(100vw-2rem)] h-[600px] lg:h-[700px] xl:h-[800px] max-h-[calc(100vh-2rem)] shadow-2xl border-0 rounded-xl overflow-hidden bg-white border border-gray-200">
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