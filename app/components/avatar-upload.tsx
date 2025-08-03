"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
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
  const { toast } = useToast();
  const router = useRouter();

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
        className={`h-34 w-34 shadow-lg bg-white transition-transform duration-200 ${isOwnProfile ? "cursor-pointer hover:scale-105 hover:shadow-2xl" : ""}`}
        onClick={handleAvatarClick}
      >
        <div className="h-24 w-full rounded-full p-1 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
          <div className="h-full w-full rounded-full bg-white p-1">
            <AvatarImage src={avatarUrl || "/placeholder-user.jpg"} alt={name} className="object-cover rounded-full" />
            <AvatarFallback className="rounded-full">{getInitials(name)}</AvatarFallback>
          </div>
        </div>
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
