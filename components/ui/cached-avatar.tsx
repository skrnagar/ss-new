"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAvatarCache } from "@/hooks/use-avatar-cache";
import { cn } from "@/lib/utils";

interface CachedAvatarProps {
  userId: string;
  avatarUrl?: string;
  fullName?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showOnlineStatus?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10", 
  lg: "h-12 w-12",
  xl: "h-16 w-16"
};

const textSizes = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base", 
  xl: "text-lg"
};

export function CachedAvatar({ 
  userId, 
  avatarUrl, 
  fullName, 
  size = "md", 
  showOnlineStatus = false,
  className 
}: CachedAvatarProps) {
  const { cachedAvatar, initials } = useAvatarCache(userId, avatarUrl, fullName);

  return (
    <div className="relative">
      <Avatar className={cn(
        sizeClasses[size],
        "ring-2 ring-gray-100",
        className
      )}>
        <AvatarImage src={cachedAvatar} />
        <AvatarFallback className={cn(
          "bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold",
          textSizes[size]
        )}>
          {initials}
        </AvatarFallback>
      </Avatar>
      {showOnlineStatus && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
      )}
    </div>
  );
} 