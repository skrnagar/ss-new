
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { ChatWindow } from "@/components/chat/chat-window";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Conversation {
  id: string;
  participants: {
    profile_id: string;
    profiles: {
      username: string;
    };
  }[];
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newChatUsername, setNewChatUsername] = useState("");

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from("conversation_participants")
      .select(`
        conversation_id,
        conversations!inner(id),
        profiles!inner(username)
      `)
      .eq("profile_id", user?.id);

    if (data) {
      const formattedConversations = data.map(d => ({
        id: d.conversation_id,
        participants: [{ profile_id: user?.id, profiles: { username: d.profiles.username } }]
      }));
      setConversations(formattedConversations);
    }
  };

  const startNewChat = async () => {
    if (!newChatUsername.trim()) return;

    // Create new conversation
    const { data: convData, error: convError } = await supabase
      .from("conversations")
      .insert({})
      .select()
      .single();

    if (convData) {
      // Add participants
      await supabase.from("conversation_participants").insert([
        { conversation_id: convData.id, profile_id: user?.id },
        { conversation_id: convData.id, profile_id: newChatUsername }
      ]);

      fetchConversations();
      setNewChatUsername("");
      setSelectedConversation(convData.id);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 space-y-4">
          <h2 className="text-2xl font-bold">Messages</h2>
          <div className="flex gap-2">
            <Input
              value={newChatUsername}
              onChange={(e) => setNewChatUsername(e.target.value)}
              placeholder="Enter username to chat"
            />
            <Button onClick={startNewChat}>Start Chat</Button>
          </div>
          {conversations.map((conversation) => (
            <Button
              key={conversation.id}
              variant={selectedConversation === conversation.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setSelectedConversation(conversation.id)}
            >
              {conversation.participants
                .filter((p) => p.profile_id !== user?.id)
                .map((p) => p.profiles.username)
                .join(", ")}
            </Button>
          ))}
        </div>
        <div className="col-span-8">
          {selectedConversation && (
            <ChatWindow
              conversationId={selectedConversation}
              currentUserId={user?.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}
