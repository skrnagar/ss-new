"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth-context';
import { supabase } from '@/lib/supabase';

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

interface ConversationContextType {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  refreshConversations: () => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export function ConversationProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  const user = session?.user;

  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
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

      // Process conversations
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
      console.error('Error fetching conversations:', err);
      setError(err?.message || 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const refreshConversations = useCallback(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`conversations_${user.id}`)
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
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversation_participants",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchConversations]);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const value = {
    conversations,
    loading,
    error,
    fetchConversations,
    refreshConversations,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversations() {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversations must be used within a ConversationProvider');
  }
  return context;
} 