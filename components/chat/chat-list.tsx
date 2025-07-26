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
import { Search, Plus, MessageCircle, ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
    const unsubscribe = subscribeToUpdates(user.id);

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
      let formattedConversations = (data as any[]).map((item) => {
        const messages = item.conversation?.messages || [];
        // Find the latest message (by created_at)
        const latestMessage = messages.reduce((latest: any, msg: any) => {
          if (!latest) return msg;
          return new Date(msg.created_at) > new Date(latest.created_at) ? msg : latest;
        }, null);
        const unreadCount = messages.filter((msg: any) => !msg.seen && msg.sender_id !== user?.id).length;
        return {
          id: item.conversation?.id || item.id,
          participants:
            item.conversation?.conversation_participants
              ?.map((p: any) => p.profiles)
              ?.filter((p: any) => p.id !== user?.id) || [],
          last_message: latestMessage,
          unreadCount,
        };
      });

      // Sort conversations by latest message created_at descending
      formattedConversations = formattedConversations.sort((a, b) => {
        const aTime = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
        const bTime = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
        return bTime - aTime;
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

  const subscribeToUpdates = (userId: string) => {
    const channelName = `conversations_changes_${userId}`;
    const subscription = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, etc.)
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex h-full w-full flex-col lg:flex-row min-h-0 bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Section 1: Conversation List */}
      <div className={cn(
        "h-full flex flex-col bg-white/80 backdrop-blur-sm border-r border-gray-200/50 w-full shadow-lg",
        selectedConversation && otherUser ? 'hidden lg:flex' : 'flex',
        "lg:max-w-[380px]"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200/50 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Messages
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsModalOpen(true)}
              className="hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 shadow-sm"
              aria-label="Start a conversation"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/70 border-gray-200 focus:bg-white focus:border-blue-300 transition-all duration-200"
              aria-label="Search conversations"
            />
          </div>
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1">
          {filteredConversations.length > 0 ? (
            <div className="p-2">
              {filteredConversations.map((conversation, index) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "group relative mb-2 rounded-xl transition-all duration-200 cursor-pointer overflow-hidden",
                    "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50",
                    selectedConversation === conversation.id 
                      ? "bg-gradient-to-r from-blue-100 to-purple-100 shadow-md" 
                      : "hover:shadow-md"
                  )}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <div className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                          <AvatarImage src={conversation.participants[0]?.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                            {conversation.participants[0]?.full_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        {/* Online indicator */}
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={cn(
                            "font-semibold truncate",
                            (conversation.unreadCount ?? 0) > 0 ? "text-gray-900" : "text-gray-700"
                          )}>
                            {conversation.participants[0]?.full_name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {conversation.last_message && (
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {formatTime(conversation.last_message.created_at)}
                              </span>
                            )}
                            {(conversation.unreadCount ?? 0) > 0 && (
                              <Badge className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {conversation.last_message && (
                          <div className="flex items-center space-x-2">
                            <p className={cn(
                              "text-sm truncate flex-1",
                              (conversation.unreadCount ?? 0) > 0 
                                ? "text-gray-900 font-medium" 
                                : "text-gray-600"
                            )}>
                              {conversation.last_message.content}
                            </p>
                            {(conversation.unreadCount ?? 0) > 0 && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover actions */}
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations found</h3>
              <p className="text-gray-500">Try adjusting your search terms</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-500 mb-4">Start connecting with other professionals</p>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Start a conversation
              </Button>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Section 2: Chat Window */}
      <div className={cn(
        "flex-1 h-full min-h-0 flex flex-col w-full",
        (selectedConversation && isProfile(otherUser)) ? 'flex' : 'hidden',
        "lg:flex relative"
      )}>
        {selectedConversation && isProfile(otherUser) ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50 bg-white/90 backdrop-blur-sm shadow-sm">
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedConversation('')}
                  className="mr-2 lg:hidden hover:bg-gray-100"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                  <AvatarImage src={otherUser.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {otherUser.full_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">{otherUser.full_name}</h3>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm text-gray-500">Active now</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 min-h-0 bg-transparent flex flex-col">
              <ChatWindow
                conversationId={selectedConversation}
                otherUser={otherUser as { id: string; full_name: string; avatar_url: string }}
                currentUserId={user?.id || ""}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center h-full bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="flex flex-col items-center justify-center gap-6 text-center p-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <MessageCircle className="h-12 w-12 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your messages</h2>
                <p className="text-gray-600 mb-6">Send private messages to other professionals</p>
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2"
                >
                  Start a conversation
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile full-screen overlay */}
      {selectedConversation && isProfile(otherUser) && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col lg:hidden">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200/50 bg-white/95 backdrop-blur-sm shadow-sm">
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSelectedConversation('')}
                className="mr-2 hover:bg-gray-100"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                <AvatarImage src={otherUser?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {otherUser?.full_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">{otherUser?.full_name}</h3>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-gray-500">Active now</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                <Video className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 min-h-0 bg-transparent flex flex-col">
            <ChatWindow
              conversationId={selectedConversation}
              otherUser={otherUser as { id: string; full_name: string; avatar_url: string }}
              currentUserId={user?.id || ""}
            />
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
