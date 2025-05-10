
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PostCreator } from "./post-creator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";

interface PostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostDialog({ open, onOpenChange }: PostDialogProps) {
  const { profile } = useAuth();
  
  // Optimize dialog mounting
  if (!open) return null;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-[90%] max-w-[800px] p-0 !mt-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-xl font-semibold">Create a post</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={profile?.avatar_url || ""}
                alt={profile?.full_name || "User"}
              />
              <AvatarFallback>{getInitials(profile?.full_name || "")}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{profile?.full_name}</p>
              <p className="text-sm text-muted-foreground">{profile?.headline}</p>
            </div>
          </div>
          <PostCreator isDialog onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
