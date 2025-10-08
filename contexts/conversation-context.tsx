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
    id: string;
    content: string;
    created_at: string;
    seen: boolean;
    sender_id: string;
  } | null;
  unreadCount?: number;
}

interface ConversationContextType {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  refreshConversations: () => void;
  updateKey: number;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export function ConversationProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updateKey, setUpdateKey] = useState(0); // Force re-render key
  const { session } = useAuth();
  const user = session?.user;

  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // First, get all conversation IDs for this user
      const { data: userConversations, error: convError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("profile_id", user.id);

      if (convError) throw convError;
      if (!userConversations || userConversations.length === 0) {
        setConversations([]);
        return;
      }

      const conversationIds = userConversations.map(c => c.conversation_id);

      // Get conversation details with participants
      const { data: conversationData, error: detailsError } = await supabase
        .from("conversations")
        .select(`
          id,
          conversation_participants!inner (
            profiles!inner (
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .in('id', conversationIds);

      if (detailsError) throw detailsError;
      if (!conversationData) return;

      // For each conversation, get the latest message and unread count
      const formattedConversations = await Promise.all(
        conversationData.map(async (conv: any) => {
          // Get latest message for this conversation
          // Using maybeSingle() instead of single() to handle empty results gracefully
          const { data: latestMsg, error: msgError } = await supabase
            .from("messages")
            .select("id, content, created_at, seen, sender_id")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(); // ✅ Returns null if no rows, doesn't throw error

          if (msgError) {
            // Silently handle error - conversation might be empty
          }

          // Count unread messages
          const { count: unreadCount, error: countError } = await supabase
            .from("messages")
            .select("*", { count: 'exact', head: true })
            .eq("conversation_id", conv.id)
            .eq("seen", false)
            .neq("sender_id", user.id);

          if (countError) {
            // Silently handle count error
          }

          // Filter out current user from participants
          const participants = conv.conversation_participants
            .map((p: any) => p.profiles)
            .filter((p: any) => p.id !== user.id);

          return {
            id: conv.id,
            participants,
            last_message: latestMsg || null,
            unreadCount: unreadCount || 0,
          };
        })
      );

      // Sort conversations by latest message time
      const sortedConversations = formattedConversations.sort((a, b) => {
        const aTime = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
        const bTime = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
        return bTime - aTime;
      });

      // Create a completely new array to ensure React detects the change
      setConversations([...sortedConversations]);
      
      // Force re-render by updating key
      setUpdateKey(prev => prev + 1);
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
      .channel(`conversation_list_${user.id}`)
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

    // Polling backup - every 5 seconds
    const pollingInterval = setInterval(() => {
      fetchConversations();
    }, 5000);

    return () => {
      clearInterval(pollingInterval);
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
    updateKey, // Include update key to trigger consumer re-renders
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