"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserSearchModal } from "./user-search-modal";
import { ChatWindow } from "@/components/chat/chat-window";
import { supabase } from "@/lib/supabase";
import { Search, Plus, MessageCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
  unreadCount?: number;
}

interface ChatListProps {
  initialUserId?: string | null;
}

// Add types for Supabase responses
interface SupabaseProfile {
  id: string;
  full_name: string;
  avatar_url: string;
}

interface SupabaseMessage {
  id: string;
  content: string;
  created_at: string;
  seen: boolean;
  sender_id: string;
}

interface SupabaseConversationParticipant {
  profiles: SupabaseProfile;
}

interface SupabaseConversation {
  id: string;
  messages: SupabaseMessage[];
  conversation_participants: SupabaseConversationParticipant[];
}

interface SupabaseConversationParticipantRow {
  conversation: SupabaseConversation;
  id: string;
}

function isProfile(user: any): user is { id: string; full_name: string; avatar_url: string } {
  return (
    user &&
    typeof user.id === 'string' &&
    typeof user.full_name === 'string' &&
    typeof user.avatar_url === 'string'
  );
}

export function ChatList({ initialUserId }: ChatListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { session } = useAuth();
  const user = session?.user;
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    fetchConversations();
    const unsubscribe = subscribeToUpdates();

    if (initialUserId) {
      startNewConversation(initialUserId);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.id, initialUserId]);

  const fetchConversations = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("conversation_participants")
        .select(`
          conversation:conversations!inner (
            id,
            messages (
              id,
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
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data) return;

      // Supabase returns a nested structure, so we process as 'any' and map to Conversation
      const formattedConversations = (data as any[]).map((item) => {
        const messages = item.conversation?.messages || [];
        const unreadCount = messages.filter((msg: any) => !msg.seen && msg.sender_id !== user?.id).length;
        return {
          id: item.conversation?.id || item.id,
          participants:
            item.conversation?.conversation_participants
              ?.map((p: any) => p.profiles)
              ?.filter((p: any) => p.id !== user?.id) || [],
          last_message: messages[0],
          unreadCount,
        };
      });

      const uniqueConversations = Array.from(
        new Map(formattedConversations.map((conv) => [conv.id, conv])).values()
      );

      setConversations(uniqueConversations);
    } catch (err: any) {
      toast({
        title: 'Error fetching conversations',
        description: err?.message || String(err),
        variant: 'destructive',
      });
    }
  };

  const subscribeToUpdates = () => {
    const subscription = supabase
      .channel("conversations_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const startNewConversation = async (userId: string) => {
    if (!user?.id || !userId) return;

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

    const existingConversation = existing?.filter((conv) =>
      otherParticipant?.some((p) => p.conversation_id === conv.conversation_id)
    );

    if (existingConversation && existingConversation.length > 0) {
      setSelectedConversation(existingConversation[0].conversation_id);
      return;
    }

    const { data: newConversation, error: conversationError } = await supabase
      .from("conversations")
      .insert({
        created_by: user.id,
        type: "direct",
      })
      .select("id")
      .single();

    if (conversationError || !newConversation) {
      console.error("Error creating conversation:", conversationError);
      return;
    }

    try {
      const participantPromises = [user.id, userId].map((id) =>
        supabase.from("conversation_participants").insert({
          conversation_id: newConversation.id,
          profile_id: id,
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
    conv.participants.some((p) => p.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const otherUser = selectedConversation
    ? conversations.find((c) => c.id === selectedConversation)?.participants[0]
    : null;

  const validSelectedConversation = typeof selectedConversation === 'string' && selectedConversation ? selectedConversation : '';
  const validOtherUser = otherUser && typeof otherUser.id === 'string' && otherUser.full_name && otherUser.avatar_url ? otherUser : null;

  const isValidChat =
    typeof selectedConversation === 'string' &&
    !!selectedConversation &&
    otherUser &&
    typeof otherUser.id === 'string' &&
    otherUser.full_name &&
    otherUser.avatar_url;

  return (
    <div className="flex h-full w-full flex-col lg:flex-row">
      {/* Section 1: Conversation List */}
      <div className={`h-full flex flex-col border-r border-gray-200 bg-white w-full ${selectedConversation && otherUser ? 'hidden lg:flex' : 'flex'} lg:max-w-[340px]`}>
        <div className="p-4 border-b bg-white rounded-t-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Messages</h2>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsModalOpen(true)}
              className="hover:bg-muted"
              aria-label="Start a conversation"
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
              aria-label="Search conversations"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {filteredConversations.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredConversations.map((conversation) => (
                <Button
                  key={conversation.id}
                  variant="ghost"
                  className={`w-full justify-start px-4 py-3 h-auto flex items-center space-x-4 transition-colors focus-visible:ring-2 focus-visible:ring-primary cursor-pointer text-left rounded-none
                    ${selectedConversation === conversation.id ? "bg-muted" : ""}
                    ${(conversation.unreadCount ?? 0) > 0 ? "font-bold bg-blue-50 text-primary" : "font-medium text-gray-900"}
                    hover:bg-gray-50 focus:bg-gray-100`}
                  onClick={() => setSelectedConversation(conversation.id)}
                  aria-label={`Open conversation with ${conversation.participants[0]?.full_name}`}
                >
                  <Avatar>
                    <AvatarImage src={conversation.participants[0]?.avatar_url} />
                    <AvatarFallback>{conversation.participants[0]?.full_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <p className={`truncate ${(conversation.unreadCount ?? 0) > 0 ? "font-bold" : "font-medium"}`}>
                        {conversation.participants[0]?.full_name}
                      </p>
                      {(conversation.unreadCount ?? 0) > 0 && (
                        <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs font-semibold">
                          {conversation.unreadCount ?? 0}
                        </span>
                      )}
                    </div>
                    {conversation.last_message && (
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground truncate max-w-[120px]">
                          {conversation.last_message.content}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {conversation.last_message.created_at ? new Date(conversation.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="p-4 text-center text-muted-foreground">No conversations found</div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">No messages yet</div>
          )}
        </ScrollArea>
      </div>
      {/* Section 2: Chat Window */}
      <div className={`flex-1 h-full flex flex-col w-full ${(selectedConversation && isProfile(otherUser)) ? 'flex' : 'hidden'} lg:flex relative`}>
        {selectedConversation && isProfile(otherUser) ? (
          <>
            <div className="flex items-center p-4 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSelectedConversation('')}
                className="mr-3 lg:hidden"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherUser.avatar_url} />
                <AvatarFallback>{otherUser.full_name[0]}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <h3 className="font-semibold">{otherUser.full_name}</h3>
                <p className="text-sm text-muted-foreground">Active now</p>
              </div>
            </div>
            <div className="h-full bg-transparent flex flex-col">
              <div className="p-4 h-full flex flex-col">
                <ChatWindow
                  conversationId={selectedConversation}
                  otherUser={otherUser as { id: string; full_name: string; avatar_url: string }}
                  currentUserId={user?.id || ""}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground bg-transparent p-4">
              <MessageCircle className="h-12 w-12" />
              <div className="text-center">
                <p className="font-medium">Your messages</p>
                <p className="text-sm">Send private messages to other professionals</p>
              </div>
              <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                Start a conversation
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* Mobile full-screen overlay */}
      {selectedConversation && isProfile(otherUser) && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col lg:hidden">
          <div className="flex items-center p-4 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSelectedConversation('')}
              className="mr-3"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser?.avatar_url} />
              <AvatarFallback>{otherUser?.full_name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <h3 className="font-semibold">{otherUser?.full_name}</h3>
              <p className="text-sm text-muted-foreground">Active now</p>
            </div>
          </div>
          <div className="flex-1 bg-transparent flex flex-col">
            <div className="p-4 flex-1 flex flex-col">
              <ChatWindow
                conversationId={selectedConversation}
                otherUser={otherUser as { id: string; full_name: string; avatar_url: string }}
                currentUserId={user?.id || ""}
              />
            </div>
          </div>
        </div>
      )}
      <UserSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartConversation={startNewConversation}
      />
    </div>
  );
}
