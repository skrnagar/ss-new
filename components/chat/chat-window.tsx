"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Send, CheckCheck, Check, ArrowLeft, Paperclip, Smile, MoreHorizontal, ChevronDown } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import Image from "next/image";
import { ImageModal } from "@/components/ui/image-modal";
import { cn } from "@/lib/utils";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [firstUnreadMessageId, setFirstUnreadMessageId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [oldestMessageId, setOldestMessageId] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
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
      .order("created_at", { ascending: true })
      .limit(50); // Initial load limit

    if (error) {
      toast({ title: "Error fetching messages", description: error.message });
      return;
    }

    // Always sort messages by created_at ascending to ensure correct order
    const sortedMessages = (data || []).sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    setMessages(sortedMessages);
    
    // Initialize lazy loading state
    if (sortedMessages.length > 0) {
      setOldestMessageId(sortedMessages[0].id);
      setHasMoreMessages(sortedMessages.length === 50);
    }
    
    // Scroll to bottom after messages are loaded to show latest messages
    setTimeout(() => {
      scrollToBottom();
      setHasScrolledToBottom(true);
    }, 100);
  }, [conversationId, toast]);

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

  // Real-time message updates
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase.channel(`messages:${conversationId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        }, 
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            const updatedMessages = [...prev, newMessage];
            return updatedMessages.sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          });
          
          // Auto-scroll to bottom if user is at bottom or if it's their own message
          if (isAtBottom || newMessage.sender_id === currentUserId) {
            setTimeout(() => scrollToBottom(), 100);
          } else {
            // Increment unread count if it's not user's own message
            if (newMessage.sender_id !== currentUserId) {
              setUnreadCount(prev => prev + 1);
              // Show scroll button with new message indicator
              setShowScrollButton(true);
            }
          }
        }
      )
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        }, 
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages((prev) => 
            prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, isAtBottom]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current;
      scrollElement.scrollTop = scrollElement.scrollHeight;
      setHasScrolledToBottom(true);
      setUnreadCount(0);
      // Mark all messages as read when scrolling to bottom
      markAllAsRead();
    }
  };

  const scrollToFirstUnread = () => {
    if (firstUnreadMessageId && scrollAreaRef.current) {
      const element = document.getElementById(firstUnreadMessageId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleScroll = () => {
    if (!scrollAreaRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    const isBottom = scrollTop + clientHeight >= scrollHeight - 30; // Reduced threshold for better detection
    setIsAtBottom(isBottom);
    
    // Show scroll button if not at bottom and there are messages
    const shouldShowScrollButton = !isBottom && messages.length > 0;
    setShowScrollButton(shouldShowScrollButton);
    
    // If user scrolls to bottom, clear unread count and mark messages as read
    if (isBottom) {
      setUnreadCount(0);
      setHasScrolledToBottom(true);
      // Mark all unread messages as read when user scrolls to bottom
      markAllAsRead();
    }
    
    // Handle lazy loading when scrolling to top
    handleScrollToTop();
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom]);

  // Scroll to bottom when chat is first opened
  useEffect(() => {
    if (messages.length > 0 && !hasScrolledToBottom) {
      // Multiple attempts to ensure scroll to bottom works
      setTimeout(() => scrollToBottom(), 100);
      setTimeout(() => scrollToBottom(), 300);
      setTimeout(() => scrollToBottom(), 500);
      setTimeout(() => scrollToBottom(), 1000);
    }
  }, [messages, hasScrolledToBottom]);

  // Reset scroll state when conversation changes
  useEffect(() => {
    setHasScrolledToBottom(false);
    setUnreadCount(0);
    setShowScrollButton(false);
    setIsAtBottom(true);
  }, [conversationId]);

  // Find first unread message and calculate unread count
  useEffect(() => {
    if (messages.length > 0) {
      const unreadMessages = messages.filter(msg => !msg.seen && msg.sender_id !== currentUserId);
      setUnreadCount(unreadMessages.length);
      
      const firstUnread = unreadMessages[0];
      if (firstUnread) {
        setFirstUnreadMessageId(firstUnread.id);
      }
    }
  }, [messages, currentUserId]);

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
    
    // Always scroll to bottom when sending a message
    setTimeout(() => scrollToBottom(), 100);
    
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
      
      // Mark message as read immediately since it's from current user
      await markAsRead(data.id);
    }
    setIsLoading(false);
  };

  const markAsRead = async (messageId: string) => {
    const { error } = await supabase
      .from("messages")
      .update({ seen: true, seen_at: new Date().toISOString() })
      .eq("id", messageId);
    
    if (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Mark all messages in conversation as read when conversation is opened
  const markAllAsRead = async () => {
    if (!conversationId) return;
    
    const { error } = await supabase
      .from("messages")
      .update({ seen: true, seen_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("sender_id", otherUser.id)
      .eq("seen", false);
    
    if (error) {
      console.error('Error marking all messages as read:', error);
    } else {
      // Clear unread count locally
      setUnreadCount(0);
    }
  };

  // Mark all messages as read when conversation is opened
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      markAllAsRead();
    }
  }, [conversationId, messages.length]);

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
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE, MMMM d");
  };

  const handleEmojiSelect = (emoji: any) => {
    const input = document.querySelector('input[name="message"]') as HTMLInputElement;
    if (input) {
      const cursorPosition = input.selectionStart || 0;
      const updatedMessage = newMessage.slice(0, cursorPosition) + emoji.native + newMessage.slice(cursorPosition);
      setNewMessage(updatedMessage);
      setShowEmojiPicker(false);
      
      // Set cursor position after emoji
      setTimeout(() => {
        const newPosition = cursorPosition + emoji.native.length;
        input.setSelectionRange(newPosition, newPosition);
        input.focus();
      }, 0);
    }
  };

  const messageGroups = groupMessagesByDate(messages);

  // Load older messages for lazy loading
  const loadOlderMessages = async () => {
    if (!conversationId || isLoadingOlderMessages || !hasMoreMessages || !oldestMessageId) return;
    
    setIsLoadingOlderMessages(true);
    
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .lt("id", oldestMessageId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setMessages(prev => {
          const newMessages = [...data.reverse(), ...prev];
          return newMessages.sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        });
        setOldestMessageId(data[data.length - 1].id);
        setHasMoreMessages(data.length === 20);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error('Error loading older messages:', error);
    } finally {
      setIsLoadingOlderMessages(false);
    }
  };

  // Handle scroll to top for lazy loading
  const handleScrollToTop = () => {
    if (!scrollAreaRef.current) return;
    
    const { scrollTop } = scrollAreaRef.current;
    if (scrollTop < 100 && hasMoreMessages && !isLoadingOlderMessages) {
      loadOlderMessages();
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Down to scroll to bottom
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowDown') {
        e.preventDefault();
        scrollToBottom();
      }
      // Escape to close emoji picker
      if (e.key === 'Escape' && showEmojiPicker) {
        e.preventDefault();
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showEmojiPicker]);

  return (
    <div className="flex flex-col h-full min-h-0 bg-gradient-to-br from-slate-50 to-blue-50" role="main" aria-label="Chat conversation">
      {/* Messages Area */}
      <div className="flex-1 min-h-0 flex flex-col">
        <ScrollArea 
          className="flex-1 p-4"
          ref={scrollAreaRef}
          onScroll={handleScroll}
          role="log"
          aria-label="Message history"
          aria-live="polite"
        >
          <div className="space-y-6">
            {/* Lazy Loading Indicator */}
            {isLoadingOlderMessages && (
              <div className="flex justify-center py-4" role="status" aria-live="polite">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" aria-hidden="true"></div>
                  <span>Loading older messages...</span>
                </div>
              </div>
            )}
            
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
                <div className="space-y-3" role="list" aria-label={`Messages from ${formatDateHeader(dateKey)}`}>
                  {dateMessages.map((message, index) => {
                    const isOwnMessage = message.sender_id === currentUserId;
                    const showAvatar = !isOwnMessage;
                    const isLastInGroup = index === dateMessages.length - 1 || 
                      dateMessages[index + 1]?.sender_id !== message.sender_id;
                    
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3",
                          isOwnMessage ? "justify-end" : "justify-start"
                        )}
                        role="listitem"
                        aria-label={`${isOwnMessage ? 'Your message' : `${otherUser.full_name}'s message`}: ${message.content}`}
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
                              : "bg-white border border-gray-200 rounded-bl-md",
                            !message.seen && message.sender_id !== currentUserId && "ring-2 ring-blue-200"
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
            
            {/* New Message Indicator */}
            {unreadCount > 0 && !isAtBottom && (
              <div className="flex justify-center my-2" role="status" aria-live="polite">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse border-2 border-white">
                  {unreadCount} new message{unreadCount > 1 ? 's' : ''} received
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Scroll Down Button */}
        {showScrollButton && (
          <Button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-4 h-12 w-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-2xl z-[9999] transition-all duration-200 hover:scale-110 border-2 border-white"
            size="icon"
            aria-label={`Scroll to bottom${unreadCount > 0 ? ` - ${unreadCount} new message${unreadCount > 1 ? 's' : ''}` : ''}`}
          >
            <ChevronDown className="h-5 w-5" />
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                {unreadCount > 99 ? "99+" : unreadCount}
              </div>
            )}
          </Button>
        )}
        
        {/* Image Modal */}
        <ImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage || ""}
        />
      </div>
      
      {/* Input Area */}
      <div className="p-4 bg-white/90 backdrop-blur-sm border-t border-gray-200/50 shadow-lg" role="form" aria-label="Message input">
        {/* Typing Indicator Above Input */}
        {otherTyping && (
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-500" role="status" aria-live="polite">
            <div className="flex space-x-1" aria-hidden="true">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="font-medium">{otherUser.full_name} is typing...</span>
          </div>
        )}
        
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
                name="message"
                style={{ fontSize: '16px' }} // Prevents zoom on iOS - must be 16px or larger
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-gray-100"
                  aria-label="Attach file"
                >
                  <Paperclip className="h-4 w-4 text-gray-500" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-gray-100"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  aria-label="Add emoji"
                  aria-expanded={showEmojiPicker}
                >
                  <Smile className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
              
              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 z-50" role="dialog" aria-label="Emoji picker">
                  <Picker
                    data={data}
                    onEmojiSelect={handleEmojiSelect}
                    theme="light"
                    set="native"
                    previewPosition="none"
                    skinTonePosition="none"
                    maxFrequentRows={0}
                    maxHistory={0}
                  />
                </div>
              )}
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