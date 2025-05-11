"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Send, CheckCheck, Check, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { ImageModal } from "@/components/ui/image-modal";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  seen: boolean;
  seen_at: string | null;
  image_url?: string | null;
}

interface Profile {
  id: string;
  avatar_url: string;
  full_name: string;
}

interface ChatWindowProps {
  conversationId: string;
  otherUser: Profile;
  currentUserId: string;
  user: Profile;
}

export function ChatWindow({ conversationId, otherUser, currentUserId, user }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        toast({ title: "Error fetching messages", description: error.message });
        return;
      }

      setMessages(data || []);
      scrollToBottom();

      const unseenMessages = data?.filter(
        (msg) => !msg.seen && msg.sender_id !== currentUserId
      );

      if (unseenMessages?.length) {
        await Promise.all(
          unseenMessages.map((msg) => markAsRead(msg.id))
        );
      }
    };

    fetchMessages();

    const subscription = supabase
      .channel(`conversation:${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, 
      (payload) => {
        const newMessage = payload.new as Message;
        setMessages((prev) => [...prev, newMessage]);
        scrollToBottom();

        if (newMessage.sender_id !== currentUserId) {
          markAsRead(newMessage.id);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, currentUserId, toast, user, otherUser]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: newMessage.trim(),
    });

    if (error) {
      toast({ title: "Error sending message", description: error.message });
    } else {
      setNewMessage("");
    }
    setIsLoading(false);
  };

  const markAsRead = async (messageId: string) => {
    await supabase
      .from("messages")
      .update({ seen: true, seen_at: new Date().toISOString() })
      .eq("id", messageId);
  };

  return (
    <div className="flex flex-col h-[100vh] bg-white">
      <div className="flex items-center p-4 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <Button
          variant="ghost"
          size="icon"
          className="mr-3"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherUser.avatar_url} />
          <AvatarFallback>{otherUser.full_name[0]}</AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <h3 className="font-semibold">{otherUser.full_name}</h3>
          <p className="text-sm text-muted-foreground">Active now</p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-2 ${
                message.sender_id === currentUserId ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={message.sender_id === currentUserId ? user?.avatar_url : otherUser.avatar_url} />
                <AvatarFallback>{message.sender_id === currentUserId ? user?.full_name?.[0] : otherUser.full_name[0]}</AvatarFallback>
              </Avatar>
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender_id === currentUserId
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="break-words">{message.content}</p>
                {message.image_url && (
                  <>
                    <div 
                      className="mt-2 relative w-48 h-48 cursor-pointer"
                      onClick={() => setSelectedImage(message.image_url)}
                    >
                      <Image
                        src={message.image_url}
                        alt="Message attachment"
                        fill
                        className="object-cover rounded-md hover:opacity-90 transition-opacity"
                      />
                    </div>
                    <ImageModal
                      isOpen={selectedImage === message.image_url}
                      onClose={() => setSelectedImage(null)}
                      imageUrl={message.image_url}
                    />
                  </>
                )}
                <div className="flex items-center justify-end space-x-1 mt-1">
                  <span className="text-xs opacity-70">
                    {format(new Date(message.created_at), "HH:mm")}
                  </span>
                  {message.sender_id === currentUserId && (
                    <span>
                      {message.seen ? (
                        <CheckCheck className="h-4 w-4" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <form onSubmit={sendMessage} className="p-4 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !newMessage.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </form>
    </div>
  );
}