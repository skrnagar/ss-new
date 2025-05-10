
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { Search } from "lucide-react";
import ChatWindow from "./chat-window";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  created_at: string;
  participants: {
    profile: {
      id: string;
      full_name: string;
      avatar_url: string;
    };
  }[];
  latest_message?: {
    content: string;
    created_at: string;
    seen: boolean;
  };
}

export default function ChatList() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [recipientId, setRecipientId] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data: conversationsData, error } = await supabase
          .from("conversations")
          .select(`
            *,
            participants:conversation_participants(
              profile:profiles(
                id,
                full_name,
                avatar_url
              )
            ),
            latest_message:messages(
              content,
              created_at,
              seen
            )
          `)
          .eq("conversation_participants.profile_id", user?.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching conversations:", error);
          return;
        }

        setConversations(conversationsData || []);
      } catch (error) {
        console.error("Error in fetchConversations:", error);
      }
    };

    if (user?.id) {
      fetchConversations();

      // Subscribe to new messages
      const subscription = supabase
        .channel("conversations")
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
    }
  }, [user?.id]);

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(
      (p) => p.profile.id !== user?.id
    )?.profile;
  };

  const filteredConversations = conversations.filter((conversation) => {
    const otherParticipant = getOtherParticipant(conversation);
    return (
      otherParticipant?.full_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) || false
    );
  });

  return (
    <div className="flex h-[600px] bg-white rounded-lg shadow-lg">
      <div className={`w-full md:w-80 border-r ${activeConversation ? 'hidden md:block' : ''}`}>
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none px-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
          <ScrollArea className="h-[500px]">
            <TabsContent value="all" className="m-0">
              {filteredConversations.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                if (!otherParticipant) return null;

                return (
                  <Button
                    key={conversation.id}
                    variant="ghost"
                    className="w-full justify-start px-4 py-3 hover:bg-muted"
                    onClick={() => {
                      setActiveConversation(conversation.id);
                      setRecipientId(otherParticipant.id);
                    }}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={otherParticipant.avatar_url} />
                      <AvatarFallback>
                        {otherParticipant.full_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3 text-left">
                      <p className="font-medium">{otherParticipant.full_name}</p>
                      {conversation.latest_message && (
                        <>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.latest_message.content}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(
                              new Date(conversation.latest_message.created_at),
                              { addSuffix: true }
                            )}
                          </p>
                        </>
                      )}
                    </div>
                  </Button>
                );
              })}
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              {/* Filter for unread messages here */}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>

      {activeConversation && recipientId && (
        <div className={`flex-1 ${!activeConversation ? 'hidden md:block' : ''}`}>
          <ChatWindow
            conversationId={activeConversation}
            recipientId={recipientId}
            onClose={() => {
              setActiveConversation(null);
              setRecipientId(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
