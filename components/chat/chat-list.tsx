
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
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
      const { data, error } = await supabase
        .from("conversation_participants")
        .select(`
          conversation_id,
          conversations!inner(
            id,
            messages(
              content,
              created_at,
              order_by: [created_at.desc],
              limit: 1
            )
          ),
          profiles!inner(
            username,
            avatar_url
          )
        `)
        .eq("profile_id", user.id);

      if (data) {
        const formattedChats = data.map((chat) => ({
          id: chat.conversation_id,
          participants: [{
            profile_id: chat.profile_id,
            profiles: chat.profiles
          }],
          last_message: chat.conversations.messages[0]
        }));
        setChats(formattedChats);
      }
    };

    fetchChats();

    // Subscribe to new messages
    const subscription = supabase
      .channel("chat_updates")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages"
      }, () => {
        fetchChats();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="space-y-2 p-4">
        {chats.map((chat) => {
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
        })}
      </div>
    </ScrollArea>
  );
}
