"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { ChatList } from "@/components/chat/chat-list";
import { ChatWindow } from "@/components/chat/chat-window";

export default function MessagesPage() {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p>Please sign in to access messages</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr]">
      <div className="border-r">
        <ChatList onSelectChat={setSelectedChat} />
      </div>
      <div>
        {selectedChat ? (
          <ChatWindow conversationId={selectedChat} />
        ) : (
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <p className="text-muted-foreground">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}