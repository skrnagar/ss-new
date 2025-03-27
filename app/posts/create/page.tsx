
"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { PostCreator } from "@/components/post-creator";

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
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex items-center justify-between p-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.push("/feed")}
          >
            <X className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium">Share</h1>
          <Button 
            variant="ghost" 
            className="invisible" // For alignment
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={profile?.avatar_url || ""}
              alt={profile?.full_name || "User"}
            />
            <AvatarFallback>{getInitials(profile?.full_name || "")}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{profile?.full_name || "User"}</p>
            <Button variant="outline" size="sm" className="mt-1 text-xs">
              Public
            </Button>
          </div>
        </div>

        <PostCreator isDialog={false} />
      </div>
    </div>
  );
}
