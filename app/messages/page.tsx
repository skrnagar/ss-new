
"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { ChatWindow } from "@/components/chat/chat-window";
import { Button } from "@/components/ui/button";

interface Conversation {
  id: string;
  participants: {
    profile_id: string;
    profiles: {
      username: string;
      avatar_url: string;
    };
  }[];
}

export default function MessagesPage() {
  const { user } = useAuthContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id,
          participants:conversation_participants(
            profile_id,
            profiles(
              username,
              avatar_url
            )
          )
        `)
        .contains("participants", [{ profile_id: user.id }]);

      if (data) setConversations(data as Conversation[]);
    };

    fetchConversations();
  }, [user]);

  const startNewConversation = async (otherUserId: string) => {
    const { data, error } = await supabase
      .from("conversations")
      .insert({})
      .select()
      .single();

    if (data) {
      await supabase.from("conversation_participants").insert([
        { conversation_id: data.id, profile_id: user!.id },
        { conversation_id: data.id, profile_id: otherUserId },
      ]);

      setSelectedConversation(data.id);
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 space-y-4">
          <h2 className="text-2xl font-bold">Messages</h2>
          {conversations.map((conversation) => (
            <Button
              key={conversation.id}
              variant={selectedConversation === conversation.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setSelectedConversation(conversation.id)}
            >
              {conversation.participants
                .filter((p) => p.profile_id !== user.id)
                .map((p) => p.profiles.username)
                .join(", ")}
            </Button>
          ))}
        </div>
        <div className="col-span-8">
          {selectedConversation && (
            <ChatWindow
              conversationId={selectedConversation}
              currentUserId={user.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}
