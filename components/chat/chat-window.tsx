"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Send, CheckCheck, Check, ArrowLeft, Paperclip, Smile, MoreHorizontal } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import Image from "next/image";
import { ImageModal } from "@/components/ui/image-modal";
import { cn } from "@/lib/utils";

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
}

export function ChatWindow({ conversationId, otherUser, currentUserId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const typingChannelRef = useRef<any>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Typing indicator: broadcast when typing
  useEffect(() => {
    if (!conversationId) return;
    // Subscribe to typing events
    const channel = supabase.channel(`typing:${conversationId}`);
    typingChannelRef.current = channel;
    channel.on('broadcast', { event: 'typing' }, (payload) => {
      if (payload.payload.userId !== currentUserId) {
        setOtherTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setOtherTyping(false), 2000);
      }
    });
    channel.subscribe();
    return () => {
      channel.unsubscribe();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [conversationId, currentUserId]);

  // Broadcast typing event
  const handleTyping = () => {
    if (typingChannelRef.current) {
      typingChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: currentUserId },
      });
    }
  };

  // Use useCallback to memoize fetchMessages
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Error fetching messages", description: error.message });
      return;
    }

    // Always sort messages by created_at ascending to ensure correct order
    const sortedMessages = (data || []).sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    setMessages(sortedMessages);
    scrollToBottom();

    const unseenMessages = sortedMessages.filter((msg) => !msg.seen && msg.sender_id !== currentUserId);
    if (unseenMessages?.length) {
      await Promise.all(unseenMessages.map((msg) => markAsRead(msg.id)));
    }
  }, [conversationId, currentUserId, toast]);

  useEffect(() => {
    if (!conversationId) return;

    // Initial fetch
    fetchMessages();

    // Use the same simple approach as chat-list.tsx that's working
    const channelName = `messages_changes_${conversationId}_${currentUserId}`;
    console.log('Setting up subscription for channel:', channelName);
    
    const subscription = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "messages",
        },
        () => {
          console.log('Message change detected in chat window, refetching...');
          fetchMessages();
        }
      )
      .subscribe();

    // Fallback: Set up polling as backup (every 1 second)
    pollingIntervalRef.current = setInterval(() => {
      console.log('Polling for new messages in chat window...');
      fetchMessages();
    }, 1000);

    return () => {
      console.log('Cleaning up chat window subscription for channel:', channelName);
      subscription.unsubscribe();
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [conversationId, currentUserId, fetchMessages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;
    setIsLoading(true);
    
    const messageToSend = {
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
      seen: false,
      seen_at: null,
    };
    
    // Optimistic update - add message immediately
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => {
      const updatedMessages = [...prev, { ...messageToSend, id: tempId }];
      return updatedMessages.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
    setNewMessage("");
    scrollToBottom();
    
    const { data, error } = await supabase.from("messages").insert(messageToSend).select().single();
    if (error) {
      toast({ title: "Error sending message", description: error.message });
      // Remove the optimistic message on error
      setMessages((prev) => prev.filter(msg => msg.id !== tempId));
    } else {
      // Replace temp message with real one
      setMessages((prev) => {
        const updatedMessages = prev.map(msg => 
          msg.id === tempId ? { ...messageToSend, id: data.id } : msg
        );
        return updatedMessages.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });
    }
    setIsLoading(false);
  };

  const markAsRead = async (messageId: string) => {
    await supabase
      .from("messages")
      .update({ seen: true, seen_at: new Date().toISOString() })
      .eq("id", messageId);
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, "HH:mm");
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, "HH:mm")}`;
    } else {
      return format(date, "MMM d, HH:mm");
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.created_at);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return "Today";
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "EEEE, MMMM d");
    }
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full min-h-0 bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Messages Area */}
      <div className="flex-1 min-h-0 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {Object.entries(messageGroups).map(([dateKey, dateMessages]) => (
              <div key={dateKey} className="space-y-4">
                {/* Date Header */}
                <div className="flex justify-center">
                  <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200/50">
                    <span className="text-sm font-medium text-gray-600">
                      {formatDateHeader(dateKey)}
                    </span>
                  </div>
                </div>
                
                {/* Messages for this date */}
                <div className="space-y-3">
                  {dateMessages.map((message, index) => {
                    const isOwnMessage = message.sender_id === currentUserId;
                    const showAvatar = !isOwnMessage;
                    const isLastInGroup = index === dateMessages.length - 1 || 
                      dateMessages[index + 1]?.sender_id !== message.sender_id;
                    
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex items-end space-x-2 group",
                          isOwnMessage ? "flex-row-reverse space-x-reverse" : ""
                        )}
                      >
                        {/* Avatar */}
                        {showAvatar && (
                          <div className="flex-shrink-0">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={otherUser.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                                {otherUser.full_name[0]}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                        
                        {/* Message Bubble */}
                        <div className={cn(
                          "flex flex-col max-w-[70%]",
                          isOwnMessage ? "items-end" : "items-start"
                        )}>
                          <div className={cn(
                            "relative px-4 py-2 rounded-2xl shadow-sm transition-all duration-200",
                            "group-hover:shadow-md",
                            isOwnMessage 
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-md" 
                              : "bg-white border border-gray-200 rounded-bl-md"
                          )}>
                            <p className="text-sm leading-relaxed break-words">
                              {message.content}
                            </p>
                            
                            {/* Image attachment */}
                            {message.image_url && (
                              <div
                                className="mt-3 relative w-48 h-48 cursor-pointer rounded-lg overflow-hidden"
                                onClick={() => setSelectedImage(message.image_url || null)}
                              >
                                <Image
                                  src={message.image_url}
                                  alt="Message attachment"
                                  fill
                                  className="object-cover hover:scale-105 transition-transform duration-200"
                                />
                              </div>
                            )}
                          </div>
                          
                          {/* Message metadata */}
                          <div className={cn(
                            "flex items-center space-x-1 mt-1 px-1",
                            isOwnMessage ? "justify-end" : "justify-start"
                          )}>
                            <span className={cn(
                              "text-xs",
                              isOwnMessage ? "text-blue-100" : "text-gray-500"
                            )}>
                              {formatMessageTime(message.created_at)}
                            </span>
                            
                            {isOwnMessage && (
                              <span className={cn(
                                "text-xs",
                                isOwnMessage ? "text-blue-100" : "text-gray-500"
                              )}>
                                {message.seen ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Spacer for alignment */}
                        {!showAvatar && <div className="w-8 flex-shrink-0"></div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {otherTyping && (
              <div className="flex items-end space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={otherUser.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                    {otherUser.full_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-2 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        
        {/* Image Modal */}
        <ImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage || ""}
        />
      </div>
      
      {/* Input Area */}
      <div className="p-4 bg-white/90 backdrop-blur-sm border-t border-gray-200/50 shadow-lg">
        <form onSubmit={sendMessage} className="space-y-3">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onInput={handleTyping}
                placeholder="Type a message..."
                disabled={isLoading}
                className="pr-12 bg-white/80 border-gray-200 focus:bg-white focus:border-blue-300 transition-all duration-200 rounded-2xl"
                aria-label="Type a message"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-gray-100"
                >
                  <Paperclip className="h-4 w-4 text-gray-500" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-gray-100"
                >
                  <Smile className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading || !newMessage.trim()} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full h-10 w-10 p-0 shadow-lg hover:shadow-xl transition-all duration-200"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}