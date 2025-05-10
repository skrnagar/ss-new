
"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";

interface UserSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUser: (conversationId: string, userId: string) => void;
}

export function UserSearchModal({
  open,
  onOpenChange,
  onSelectUser,
}: UserSearchModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // First get connected users
      const { data: connections } = await supabase
        .from("connections")
        .select("connected_user_id")
        .eq("user_id", user?.id)
        .eq("status", "accepted");

      const connectedUserIds = connections?.map((c) => c.connected_user_id) || [];

      // Then search for users in the connected list
      const { data: users, error } = await supabase
        .from("profiles")
        .select("*")
        .in("id", connectedUserIds)
        .ilike("full_name", `%${query}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(users || []);
    } catch (error) {
      console.error("Error searching users:", error);
      toast({
        title: "Error searching users",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startConversation = async (recipientId: string) => {
    try {
      // Check if conversation already exists
      const { data: existingConvo } = await supabase
        .from("conversations")
        .select("id, conversation_participants!inner(*)")
        .eq("conversation_participants.profile_id", user?.id)
        .eq("conversation_participants.profile_id", recipientId)
        .single();

      if (existingConvo) {
        onSelectUser(existingConvo.id, recipientId);
        onOpenChange(false);
        return;
      }

      // Create new conversation
      const { data: newConvo, error: convoError } = await supabase
        .from("conversations")
        .insert({})
        .select()
        .single();

      if (convoError) throw convoError;

      // Add participants
      const { error: participantsError } = await supabase
        .from("conversation_participants")
        .insert([
          { conversation_id: newConvo.id, profile_id: user?.id },
          { conversation_id: newConvo.id, profile_id: recipientId },
        ]);

      if (participantsError) throw participantsError;

      onSelectUser(newConvo.id, recipientId);
      onOpenChange(false);
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast({
        title: "Error starting conversation",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search connections..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchUsers(e.target.value);
            }}
          />
        </div>
        <div className="mt-4 space-y-2">
          {searchResults.map((result) => (
            <Button
              key={result.id}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => startConversation(result.id)}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={result.avatar_url} />
                <AvatarFallback>{result.full_name[0]}</AvatarFallback>
              </Avatar>
              <div className="ml-3 text-left">
                <p className="font-medium">{result.full_name}</p>
                {result.headline && (
                  <p className="text-sm text-muted-foreground">{result.headline}</p>
                )}
              </div>
            </Button>
          ))}
          {isLoading && <p className="text-center">Searching...</p>}
          {!isLoading && searchQuery && searchResults.length === 0 && (
            <p className="text-center text-muted-foreground">No results found</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
