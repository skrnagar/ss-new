
"use client";

import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { useState } from "react";
import { useRef } from "react";

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartConversation: (userId: string) => void;
}

export function UserSearchModal({ isOpen, onClose, onStartConversation }: UserSearchModalProps) {
  const { session } = useAuth();
  const user = session?.user;
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      // If query is empty, show suggested connections
      const { data: suggestions, error } = await supabase
        .from("profiles")
        .select("id, full_name, headline, avatar_url")
        .neq("id", user?.id)
        .limit(10);

      if (error) {
        toast({
          title: "Error fetching suggestions",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setSearchResults(suggestions || []);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, headline, avatar_url")
      .neq("id", user?.id)
      .ilike("full_name", `%${query}%`)
      .limit(10);

    if (error) {
      toast({
        title: "Error searching users",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setSearchResults(data || []);
  };

  const startConversation = async (recipientId: string) => {
    try {
      onStartConversation(recipientId);
      onClose();
    } catch (error: any) {
      console.error("Error starting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 border bg-background p-6 shadow-lg duration-200 data-[state=open]:zoom-in-95 sm:rounded-lg">
        <DialogTitle className="text-xl font-semibold mb-4">New message</DialogTitle>
        <div className="relative">
          <Input
            placeholder="Type a name or multiple names"
            value={searchQuery}
            onChange={(e) => {
              const value = e.target.value;
              if (debounceRef.current) clearTimeout(debounceRef.current);
              debounceRef.current = setTimeout(() => {
                handleSearch(value);
              }, 350);
              setSearchQuery(value);
            }}
            className="pl-10 w-full mb-4"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>

        <div className="mt-2">
          <div className="mb-4 text-sm font-medium text-muted-foreground">
            {searchQuery ? "Search results" : "Suggested"}
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {searchResults.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between p-3 hover:bg-muted/60 rounded-md cursor-pointer transition-colors"
                onClick={() => startConversation(profile.id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback>
                      {profile.full_name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-base">{profile.full_name}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {profile.headline || "Safety Professional"}
                    </div>
                  </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
