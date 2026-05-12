"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ProfilePhotoModal } from "./profile-photo-modal";

interface AvatarUploadProps {
  userId: string;
  avatarUrl: string | null;
  name: string;
  isOwnProfile: boolean;
  onAvatarChange?: (url: string) => void;
}

export function AvatarUpload({
  userId,
  avatarUrl,
  name,
  isOwnProfile,
  onAvatarChange,
}: AvatarUploadProps) {
  const [modalOpen, setModalOpen] = useState(false);

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part?.[0] || "")
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleAvatarClick = () => {
    if (isOwnProfile) {
      setModalOpen(true);
    }
  };

  return (
    <>
      <Avatar
        className={cn(
          "h-28 w-28 shrink-0 shadow-lg sm:h-32 sm:w-32",
          isOwnProfile &&
            "cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-xl"
        )}
        onClick={handleAvatarClick}
      >
        <AvatarImage
          src={avatarUrl || undefined}
          alt={name}
          className="object-cover"
        />
        <AvatarFallback className="text-lg font-semibold">{getInitials(name)}</AvatarFallback>
      </Avatar>

      {/* Profile Photo Modal */}
      <ProfilePhotoModal
        userId={userId}
        avatarUrl={avatarUrl}
        name={name}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
