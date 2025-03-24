"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

interface UserSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUser: (userId: string) => void;
}

export function UserSearchModal({ open, onOpenChange, onSelectUser }: UserSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || !currentUser) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .neq('id', currentUser.id)
        .ilike('username', `%${searchQuery}%`)
        .limit(10);

      if (data && !error) {
        setUsers(data);
      }
    };

    searchUsers();
  }, [searchQuery, currentUser]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="user-search-description">
        <DialogHeader>
          <DialogTitle>Start a conversation</DialogTitle>
          <DialogDescription id="user-search-description">
            Search for users to start a conversation with.
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Search by username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />
        <div className="space-y-2">
          {users.map((user) => (
            <Button
              key={user.id}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                onSelectUser(user.id);
                onOpenChange(false);
              }}
            >
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span>{user.username}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}