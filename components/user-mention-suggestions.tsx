"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { Search } from "lucide-react";
import { InlineLoader } from "@/components/ui/logo-loder";

interface User {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
}

interface UserMentionSuggestionsProps {
  query: string;
  onSelectUser: (username: string) => void;
  onClose: () => void;
}

export function UserMentionSuggestions({ query, onSelectUser, onClose }: UserMentionSuggestionsProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!query || query.length < 2) {
      setUsers([]);
      return;
    }

    const searchUsers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .ilike("username", `%${query}%`)
          .or(`full_name.ilike.%${query}%`)
          .limit(5);

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error("Error searching users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [users]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (users.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % users.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + users.length) % users.length);
        break;
      case "Enter":
        e.preventDefault();
        if (users[selectedIndex]) {
          onSelectUser(users[selectedIndex].username);
        }
        break;
      case "Escape":
        e.preventDefault();
        onClose();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [users, selectedIndex]);

  if (users.length === 0) {
    return null;
  }

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part?.[0] || "")
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-[9999] max-h-48 overflow-y-auto">
      <div className="p-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Search className="h-3 w-3 text-blue-600" />
          <span>Suggestions for "{query}"</span>
        </div>
      </div>
      <div className="py-1">
        {loading ? (
          <div className="p-3 text-center text-xs text-gray-600">
            <div className="flex items-center justify-center gap-2">
              <InlineLoader size="sm" variant="line" />
              Searching...
            </div>
          </div>
        ) : (
          users.map((user, index) => (
            <button
              key={user.id}
              className={`w-full flex items-center gap-2 p-2 text-left hover:bg-blue-50 transition-colors ${
                index === selectedIndex ? "bg-blue-100 border-l-2 border-blue-600" : ""
              }`}
              onClick={() => onSelectUser(user.username)}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.avatar_url} alt={user.full_name} />
                <AvatarFallback className="text-xs">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user.full_name}
                </div>
                <div className="text-xs text-blue-600 truncate">
                  @{user.username}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
} 