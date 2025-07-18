
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
import { Search, Plus, MessageCircle, ArrowLeft } from "lucide-react";

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

interface ChatListProps {
  initialUserId?: string | null;
}

export function ChatList({ initialUserId }: ChatListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    fetchConversations();
    subscribeToUpdates();
    
    if (initialUserId) {
      startNewConversation(initialUserId);
    }
  }, [user?.id, initialUserId]);

  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from("conversation_participants")
      .select(`
        conversation:conversations!inner (
          id,
          messages (
            content,
            created_at,
            seen,
            sender_id
          ),
          conversation_participants!inner (
            profiles!inner (
              id,
              full_name,
              avatar_url
            )
          )
        )
      `)
      .eq('profile_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const formattedConversations = data.map((item: any) => ({
        id: item.conversation?.id || item.id,
        participants: item.conversation?.conversation_participants
          ?.map((p: any) => p.profiles)
          ?.filter((p: any) => p.id !== user?.id) || [],
        last_message: item.conversation?.messages?.[0],
      }));

      const uniqueConversations = Array.from(
        new Map(formattedConversations.map(conv => [conv.id, conv])).values()
      );
      
      setConversations(uniqueConversations);
    }
  };

  const subscribeToUpdates = () => {
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
  };

  const startNewConversation = async (userId: string) => {
    if (!user) return;
    
    const { data: existing } = await supabase
      .from("conversation_participants")
      .select(`
        conversation_id,
        conversations!inner (
          id,
          type
        )
      `)
      .eq("profile_id", user.id)
      .eq("conversations.type", "direct");

    const { data: otherParticipant } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("profile_id", userId);

    const existingConversation = existing?.filter(conv => 
      otherParticipant?.some(p => p.conversation_id === conv.conversation_id)
    );

    if (existingConversation && existingConversation.length > 0) {
      setSelectedConversation(existingConversation[0].conversation_id);
      return;
    }

    const { data: newConversation, error: conversationError } = await supabase
      .from("conversations")
      .insert({
        created_by: user.id,
        type: "direct"
      })
      .select("id")
      .single();

    if (conversationError || !newConversation) {
      console.error("Error creating conversation:", conversationError);
      return;
    }

    try {
      const participantPromises = [user.id, userId].map(id =>
        supabase
          .from("conversation_participants")
          .insert({
            conversation_id: newConversation.id,
            profile_id: id
          })
      );

      await Promise.all(participantPromises);
      await fetchConversations();
      setSelectedConversation(newConversation.id);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding participants:", error);
    }
  };

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
    <div className="flex h-[calc(100vh-4rem)] bg-white relative">
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-[320px] border-r flex-col`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Messages</h2>
            <Button 
              variant="outline"
              size="icon"
              onClick={() => setIsModalOpen(true)}
              className="hover:bg-muted"
            >
              <Plus className="h-4 w-4" />
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
                    <p className="font-medium">
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
          ) : searchQuery ? (
            <div className="p-4 text-center text-muted-foreground">
              No conversations found
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No messages yet
            </div>
          )}
        </ScrollArea>
      </div>

      <div className={`flex-1 ${!selectedConversation ? 'hidden md:block' : 'block'}`}>
        {selectedConversation && otherUser ? (
          <>
            <button 
              onClick={() => setSelectedConversation(null)}
              className="md:hidden absolute top-4 left-4 z-10"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <ChatWindow
              conversationId={selectedConversation}
              otherUser={otherUser}
              currentUserId={user?.id || ""}
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center flex-col gap-4 text-muted-foreground">
            <MessageCircle className="h-12 w-12" />
            <div className="text-center">
              <p className="font-medium">Your messages</p>
              <p className="text-sm">Send private messages to other professionals</p>
            </div>
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>
              Start a conversation
            </Button>
          </div>
        )}
      </div>

      <UserSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartConversation={startNewConversation}
      />
    </div>
  );
}
