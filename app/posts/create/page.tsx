"use client";

import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostCreator } from "@/components/post-creator";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreatePostPage() {
  const { profile } = useAuth();
  const router = useRouter();

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
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-background border-b">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.back()}
          className="mr-2"
        >
          <X className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Create Post</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      <div className="container max-w-2xl px-4 pt-20 pb-16">
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

        <PostCreator />
      </div>
    </div>
  );
}