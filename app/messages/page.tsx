"use client";

import { ChatList } from "@/components/chat/chat-list";
import { ChatWindow } from "@/components/chat/chat-window";
import { UserSearchModal } from "@/components/chat/user-search-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { MessageCircle, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface Conversation {
  id: string;
  conversation_participants: {
    profile_id: string;
    profiles: {
      username: string;
      avatar_url?: string;
    };
  }[];
  last_message?: {
    content: string;
    created_at: string;
  };
}

interface ChatPreview {
  id: string;
  conversation_participants: {
    profile_id: string;
    profiles: {
      username: string;
      avatar_url?: string;
    };
  }[];
  last_message?: {
    content: string;
    created_at: string;
  };
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<string | undefined>();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const fetchConversations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("conversations")
      .select(`
        id,
        created_at,
        conversation_participants!inner (
          profile_id,
          profiles!inner (
            username,
            avatar_url
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (data && !error) {
      const formattedConversations = data.map((conv) => ({
        id: conv.id,
        conversation_participants: conv.conversation_participants.map((participant) => ({
          profile_id: participant.profile_id,
          profiles: participant.profiles,
        })),
        last_message: conv.messages?.[0]
          ? {
              content: conv.messages[0].content,
              created_at: conv.messages[0].created_at,
            }
          : undefined,
      }));
      setConversations(formattedConversations);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  const startNewChat = async (otherUserId: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        created_by: user.id,
      })
      .select()
      .single();

    if (data && !error) {
      await Promise.all([
        supabase.from("conversation_participants").insert({
          conversation_id: data.id,
          profile_id: user.id,
        }),
        supabase.from("conversation_participants").insert({
          conversation_id: data.id,
          profile_id: otherUserId,
        }),
      ]);

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
          <Button size="icon" variant="ghost" onClick={() => setSearchModalOpen(true)}>
            <Plus className="h-5 w-5" />
          </Button>
          <UserSearchModal
            isOpen={searchModalOpen}
            onClose={() => setSearchModalOpen(false)}
            onStartConversation={startNewChat}
          />
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
          <ChatList
            conversations={conversations}
            onSelect={(chat) => setSelectedChat(chat.id)}
            selectedId={selectedChat}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <ChatWindow conversationId={selectedChat} currentUserId={user?.id} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation or start a new one
          </div>
        )}
      </div>
    </div>
  );
}
