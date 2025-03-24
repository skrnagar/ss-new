
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface ChatPreview {
  id: string;
  participants: {
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

export function ChatList({ onSelectChat }: { onSelectChat: (id: string) => void }) {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatPreview[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchChats = async () => {
      // First get all conversations the user is part of
      const { data: participations, error: participationError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("profile_id", user.id);

      if (participationError) {
        console.error("Error fetching conversations:", participationError);
        return;
      }

      if (!participations?.length) return;

      const conversationIds = participations.map(p => p.conversation_id);

      // Then get the other participants and last messages for these conversations
      const { data: conversations, error: conversationsError } = await supabase
        .from("conversation_participants")
        .select(`
          conversation_id,
          profiles!inner(
            username,
            avatar_url
          ),
          conversations!inner(
            id,
            messages(
              content,
              created_at,
              sender_id
            )
          )
        `)
        .in("conversation_id", conversationIds)
        .neq("profile_id", user.id);

      if (conversationsError) {
        console.error("Error fetching conversation details:", conversationsError);
        return;
      }

      const formattedChats = conversations?.map(chat => ({
        id: chat.conversation_id,
        participants: [{
          profile_id: chat.profiles.id,
          profiles: {
            username: chat.profiles.username,
            avatar_url: chat.profiles.avatar_url
          }
        }],
        last_message: chat.conversations.messages[0]
      }));

      setChats(formattedChats || []);
    };

    fetchChats();
  }, [user]);

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="space-y-2 p-4">
        {chats.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            No conversations yet
          </div>
        ) : (
          chats.map((chat) => {
            const otherParticipant = chat.participants[0];
            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <Avatar>
                  <AvatarImage src={otherParticipant.profiles.avatar_url} />
                  <AvatarFallback>
                    {otherParticipant.profiles.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="font-medium">{otherParticipant.profiles.username}</p>
                  {chat.last_message && (
                    <>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {chat.last_message.content}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(chat.last_message.created_at), { addSuffix: true })}
                      </p>
                    </>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
}
import { MessageCircle } from "lucide-react";

export interface ChatListProps {
  conversations: any[];
  onSelect: (conversation: any) => void;
  selectedId?: string;
}

export function ChatList({ conversations, onSelect, selectedId }: ChatListProps) {
  return (
    <div className="flex-1 overflow-auto space-y-2">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer ${
            selectedId === conversation.id ? "bg-muted" : ""
          }`}
          onClick={() => onSelect(conversation)}
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{conversation.title}</p>
            <p className="text-sm text-muted-foreground truncate">
              {conversation.lastMessage}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
