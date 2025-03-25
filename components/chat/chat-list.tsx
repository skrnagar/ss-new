"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

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

export interface ChatListProps {
  conversations: ChatPreview[];
  onSelect: (conversation: ChatPreview) => void;
  selectedId?: string | null;
}

export function ChatList({ onSelect, selectedId }: ChatListProps) {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatPreview[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchChats = async () => {
      const { data: participations, error: participationError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("profile_id", user.id);

      if (participationError) {
        console.error("Error fetching conversations:", participationError);
        return;
      }

      if (!participations?.length) return;

      const conversationIds = participations.map((p) => p.conversation_id);

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

      const formattedChats = conversations?.map((chat) => ({
        id: chat.conversation_id,
        participants: [
          {
            profile_id: chat.profiles.id,
            profiles: {
              username: chat.profiles.username,
              avatar_url: chat.profiles.avatar_url,
            },
          },
        ],
        last_message: chat.conversations.messages[0],
      }));

      setChats(formattedChats || []);
    };

    fetchChats();
  }, [user]);

  return (
    <div className="flex-1 overflow-auto space-y-2">
      {chats.length === 0 ? (
        <div className="text-center text-muted-foreground p-4">No conversations yet</div>
      ) : (
        chats.map((chat) => {
          const otherParticipant = chat.participants[0];
          return (
            <div
              key={chat.id}
              className={`flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer ${
                selectedId === chat.id ? "bg-muted" : ""
              }`}
              onClick={() => onSelect(chat)}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {otherParticipant.profiles.avatar_url ? (
                  <Avatar>
                    <AvatarImage src={otherParticipant.profiles.avatar_url} />
                    <AvatarFallback>
                      {otherParticipant.profiles.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <MessageCircle className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{otherParticipant.profiles.username}</p>
                {chat.last_message && (
                  <>
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.last_message.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(chat.last_message.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
