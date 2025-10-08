"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowLeft, Users, Search, Plus, X, Phone, Video } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useConversations } from "@/contexts/conversation-context";
import Link from "next/link";
import { ChatWindow } from "@/components/chat/chat-window";
import { UserSearchModal } from "@/components/chat/user-search-modal";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAvatarCache } from "@/hooks/use-avatar-cache";
import { CachedAvatar } from "@/components/ui/cached-avatar";
import { InlineLoader } from "@/components/ui/logo-loder";

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

interface ChatInterfaceProps {
  onBack?: () => void;
  showBackButton?: boolean;
  className?: string;
}

export function ChatInterface({ onBack, showBackButton = false, className = "" }: ChatInterfaceProps) {
  const [selectedConversation, setSelectedConversation] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { session, isLoading } = useAuth();
  const { conversations, loading, error, refreshConversations, updateKey } = useConversations();
  const user = session?.user;

  // Conversations are now managed by the context

  const startNewConversation = async (userId: string) => {
    if (!user?.id) return;
    
    try {
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("profile_id", user.id);

      if (existingConversation) {
        const existingIds = existingConversation.map(c => c.conversation_id);
        
        const { data: otherUserConversation } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("profile_id", userId)
          .in("conversation_id", existingIds);

        if (otherUserConversation && otherUserConversation.length > 0) {
          // Conversation exists, select it
          const conversationId = otherUserConversation[0].conversation_id;
          setSelectedConversation(conversationId);
          
          // Get user details
          const { data: userData } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .eq("id", userId)
            .single();
          
          if (userData) {
            setSelectedUser(userData);
          }
          return;
        }
      }

      // Create new conversation
      const { data: conversation, error: conversationError } = await supabase
        .from("conversations")
        .insert({})
        .select()
        .single();

      if (conversationError) throw conversationError;

      // Add participants
      await supabase.from("conversation_participants").insert([
        { conversation_id: conversation.id, profile_id: user.id },
        { conversation_id: conversation.id, profile_id: userId }
      ]);

      setSelectedConversation(conversation.id);
      
      // Get user details
      const { data: userData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", userId)
        .single();
      
      if (userData) {
        setSelectedUser(userData);
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

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

  const filteredConversations = conversations.filter(conv => {
    const participant = conv.participants[0];
    return participant?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           conv.last_message?.content?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleBack = () => {
    if (selectedConversation) {
      setSelectedConversation('');
      setSelectedUser(null);
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Content */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          // Loading state
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <InlineLoader size="md" variant="glitch" />
            <p className="text-sm text-gray-500 mt-2">Loading...</p>
          </div>
        ) : !user ? (
          // Login prompt for unauthenticated users
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign in to chat</h3>
            <p className="text-sm text-gray-500 mb-6">Connect with professionals and start conversations.</p>
            <Link href="/auth/login" className="w-full">
              <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                Sign In
              </Button>
            </Link>
          </div>
        ) : selectedConversation && selectedUser ? (
          // Chat window with mobile-style header
          <div className="h-full flex flex-col">
            {/* Mobile-style Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50 bg-white/90 backdrop-blur-sm shadow-sm">
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedConversation('')}
                  className="mr-2 hover:bg-gray-100 rounded-full"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <CachedAvatar
                  userId={selectedUser.id}
                  avatarUrl={selectedUser.avatar_url}
                  fullName={selectedUser.full_name}
                  size="md"
                  className="ring-2 ring-white shadow-sm"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedUser.full_name}</h3>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
                    <p className="text-sm text-gray-500">Active now</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-full">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-full">
                  <Video className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 min-h-0 bg-transparent flex flex-col">
              <ChatWindow
                conversationId={selectedConversation}
                otherUser={selectedUser}
                currentUserId={user.id}
                onMessageSent={refreshConversations}
              />
            </div>
          </div>
        ) : (
          // Conversations list
          <div className="h-full flex flex-col">
            {/* LinkedIn-style Header */}
            <div className="p-4 border-b border-gray-100 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CachedAvatar
                    userId={user?.id || ""}
                    avatarUrl={user?.user_metadata?.avatar_url}
                    fullName={user?.user_metadata?.full_name}
                    size="sm"
                    className="ring-2 ring-gray-100"
                  />
                  <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-gray-100 rounded-full"
                  onClick={onBack}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Search Row with + Icon */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  size="icon"
                  className="h-10 w-10 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
                >
                  <Plus className="h-5 w-5" />
                </Button>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-gray-200 h-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1">
              {filteredConversations.length > 0 ? (
                <div className="p-2">
                  {filteredConversations.map((conversation) => {
                    const participant = conversation.participants[0];
                    if (!participant) return null;



                    return (
                      <div
                        key={`${conversation.id}-${updateKey}`}
                        onClick={() => {
                          setSelectedConversation(conversation.id);
                          setSelectedUser(participant);
                        }}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-100"
                      >
                        <CachedAvatar
                          userId={participant.id}
                          avatarUrl={participant.avatar_url}
                          fullName={participant.full_name}
                          size="lg"
                          showOnlineStatus={true}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {participant.full_name}
                            </h3>
                            {conversation.last_message && (
                              <span className="text-xs text-gray-500 ml-2">
                                {formatTime(conversation.last_message.created_at)}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.last_message?.content || "No messages yet"}
                            </p>
                            {conversation.unreadCount && conversation.unreadCount > 0 && (
                              <Badge className="ml-2 bg-red-500 text-white text-xs font-medium min-w-[20px] h-5 flex items-center justify-center">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : searchQuery ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Search className="h-8 w-8 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations found</h3>
                  <p className="text-gray-500">Try adjusting your search terms</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-500 mb-4">Start connecting with other professionals</p>
                  <Button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg"
                  >
                    Start a conversation
                  </Button>
                </div>
              )}
            </ScrollArea>
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