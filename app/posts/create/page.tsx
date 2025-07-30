"use client";

import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostCreator } from "@/components/post-creator";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Modern Header with Glass Effect */}
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200/60">
        <div className="flex items-center justify-between px-4 h-16">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10 rounded-full hover:bg-gray-100 transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Create Post
            </h1>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main Content with Enhanced Spacing */}
      <div className="container max-w-2xl px-4 pt-24 pb-20">
        {/* Enhanced User Profile Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-gray-200/50 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-blue-100 shadow-sm">
                <AvatarImage
                  src={profile?.avatar_url || ""}
                  alt={profile?.full_name || "User"}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {getInitials(profile?.full_name || "")}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-base">{profile?.full_name}</p>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {profile?.headline || "Ready to share"}
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Post Creator */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm">
          <PostCreator />
        </div>
      </div>
    </div>
  );
}