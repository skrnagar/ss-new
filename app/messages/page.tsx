
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { ChatList } from "@/components/chat/chat-list";
import { ChatWindow } from "@/components/chat/chat-window";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Search, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function MessagesPage() {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        conversation_participants (
          profiles (
            id,
            username,
            avatar_url
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setConversations(data);
    }
  };

  const startNewChat = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        created_by: user.id
      })
      .select()
      .single();

    if (data && !error) {
      await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: data.id,
          profile_id: user.id
        });

      await fetchConversations();
      setSelectedChat(data.id);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p>Please sign in to access messages</p>
      </div>
    );
  }

  return (
    <div className="container flex h-[calc(100vh-4rem)] gap-6 py-6">
      <div className="w-80 flex flex-col border-r pr-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Messages</h2>
          <Button size="icon" variant="ghost" onClick={startNewChat}>
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
          <ChatList conversations={conversations} onSelect={(chat) => setSelectedChat(chat.id)} selectedId={selectedChat} />
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <ChatWindow conversationId={selectedChat} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation or start a new one
          </div>
        )}
      </div>
    </div>
  );
}
