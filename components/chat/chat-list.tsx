
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserSearchModal } from "./user-search-modal";
import { ChatWindow } from "@/components/chat/chat-window";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Search, Plus } from "lucide-react";

interface Conversation {
  id: string;
  participants: Array<{
    id: string;
    full_name: string;
    avatar_url: string;
  }>;
  last_message?: {
    content: string;
    created_at: string;
    seen: boolean;
  };
}

export function ChatList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id,
          messages!messages_conversation_id_fkey (
            content,
            created_at,
            seen,
            sender_id
          ),
          conversation_participants!conversation_participants_conversation_id_fkey (
            profiles!conversation_participants_profile_id_fkey (
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const formattedConversations = data.map((conv) => ({
          id: conv.id,
          participants: conv.conversation_participants
            .map((p) => p.profiles)
            .filter((p) => p.id !== user.id),
          last_message: conv.messages[0],
        }));
        setConversations(formattedConversations);
      }
    };

    fetchConversations();

    const subscription = supabase
      .channel("conversations_changes")
      .on("postgres_changes", { 
        event: "*", 
        schema: "public",
        table: "messages"
      }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  const filteredConversations = conversations.filter((conv) =>
    conv.participants.some((p) =>
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const otherUser = selectedConversation
    ? conversations
        .find((c) => c.id === selectedConversation)
        ?.participants[0]
    : null;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-[320px] border-r flex flex-col bg-white">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Messages</h2>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <Button
                key={conversation.id}
                variant="ghost"
                className={`w-full justify-start px-4 py-3 h-auto ${
                  selectedConversation === conversation.id ? "bg-muted" : ""
                }`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <div className="flex items-center space-x-4 w-full">
                  <Avatar>
                    <AvatarImage src={conversation.participants[0].avatar_url} />
                    <AvatarFallback>
                      {conversation.participants[0].full_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <p className={`${!conversation.last_message?.seen ? "font-semibold" : ""}`}>
                      {conversation.participants[0].full_name}
                    </p>
                    {conversation.last_message && (
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.last_message.content}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {format(
                            new Date(conversation.last_message.created_at),
                            "HH:mm"
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Button>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No conversations found
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="flex-1">
        {selectedConversation && otherUser ? (
          <ChatWindow
            conversationId={selectedConversation}
            otherUser={otherUser}
            currentUserId={user?.id || ""}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Select a conversation to start chatting</p>
          </div>
        )}
      </div>

      <UserSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartConversation={(userId) => {
          // Handle starting new conversation
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
