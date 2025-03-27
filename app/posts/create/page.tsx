
"use client";

import { X, Image as ImageIcon, AtSign, Hash } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";

export default function CreatePostPage() {
  const router = useRouter();
  const { profile } = useAuth();

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <X className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold">Share</h1>
        </div>
        <Button variant="secondary" className="rounded-full px-6">
          Post
        </Button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={profile?.avatar_url || ""}
              alt={profile?.full_name || "User"}
            />
            <AvatarFallback>{getInitials(profile?.full_name || "")}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">{profile?.full_name}</span>
              <Button variant="outline" size="sm" className="h-6 text-xs rounded-full">
                Public
              </Button>
            </div>
            <Textarea 
              placeholder="Share your thoughts. Add photos or hashtags."
              className="min-h-[200px] resize-none border-none shadow-none focus-visible:ring-0 p-0 text-base"
            />
          </div>
        </div>
      </div>

      {/* Bottom Icons */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
        <div className="flex gap-6">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ImageIcon className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <AtSign className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Hash className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
