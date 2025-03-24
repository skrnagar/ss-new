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
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Search, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      // Fetch conversations for the current user
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    // TODO: Implement conversation fetching
  };

  return (
    <div className="container flex h-[calc(100vh-4rem)] gap-6 py-6">
      {/* Sidebar */}
      <div className="w-80 flex flex-col border-r pr-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Messages</h2>
          <Button size="icon" variant="ghost">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search messages..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-auto">
          {/* Placeholder conversations */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">Conversation {i}</p>
                <p className="text-sm text-muted-foreground truncate">
                  Latest message preview...
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Select a conversation or start a new one
        </div>
      </div>
    </div>
  );
}
