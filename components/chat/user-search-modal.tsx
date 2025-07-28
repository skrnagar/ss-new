
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
import { X, UserPlus, Loader2 } from "lucide-react";
import { useEffect } from "react";

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
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setEmpty(false);
      setLoading(false);
      handleSearch("");
    }
    // eslint-disable-next-line
  }, [isOpen]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setLoading(true);
    setEmpty(false);

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
      setLoading(false);
      setEmpty((suggestions || []).length === 0);
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
    setLoading(false);
    setEmpty((data || []).length === 0);
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
      <DialogContent className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 border bg-white/80 dark:bg-black/80 backdrop-blur-lg p-0 shadow-2xl duration-200 data-[state=open]:zoom-in-95 sm:rounded-2xl overflow-hidden">
        <div className="relative flex flex-col min-h-[420px]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-white/20">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">New Message</DialogTitle>
          </div>
          {/* Search Bar */}
          <div className="relative px-6 pt-4 pb-2">
            <Input
              placeholder="Search people by name..."
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                if (debounceRef.current) clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(() => {
                  handleSearch(value);
                }, 350);
                setSearchQuery(value);
              }}
              className="pl-10 pr-10 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-black/60 shadow-sm focus:ring-2 focus:ring-blue-400"
            />
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
            {searchQuery && (
              <button
                className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white"
                onClick={() => {
                  setSearchQuery("");
                  handleSearch("");
                }}
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          {/* Results */}
          <div className="flex-1 px-6 pb-6 pt-2 overflow-y-auto max-h-[350px] sm:max-h-[400px] scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-blue-900 scrollbar-track-transparent">
            {loading ? (
              <div className="space-y-4 mt-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-200 to-purple-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                      <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800" />
                    </div>
                    <div className="h-8 w-24 rounded bg-gray-100 dark:bg-gray-800" />
                  </div>
                ))}
              </div>
            ) : empty ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-gray-500 dark:text-gray-400">
                <UserPlus className="h-10 w-10 mb-2 text-blue-400" />
                <div className="font-semibold text-lg">No users found</div>
                <div className="text-sm">Try a different name or check your spelling.</div>
              </div>
            ) : (
              <div className="space-y-3 mt-2">
                {searchResults.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between p-3 bg-white/90 dark:bg-black/60 rounded-xl shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-800 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback>
                          {profile.full_name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-base text-gray-900 dark:text-white group-hover:text-blue-600">
                          {profile.full_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-300 line-clamp-1">
                          {profile.headline || "Safety Professional"}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="gradient"
                      size="sm"
                      className="rounded-lg px-4 py-2 font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-md hover:from-blue-600 hover:to-purple-600"
                      onClick={() => startConversation(profile.id)}
                    >
                      Start Chat
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
