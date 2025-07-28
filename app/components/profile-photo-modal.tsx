"use client";

import ReactDOM from "react-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Added import for Input component
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Camera, Trash2, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface ProfilePhotoModalProps {
  userId: string;
  avatarUrl: string | null;
  name: string;
  isOpen: boolean;
  onClose: () => void;
  onAvatarChange?: (url: string) => void; // Added optional callback
}

export function ProfilePhotoModal({
  userId,
  avatarUrl,
  name,
  isOpen,
  onClose,
  onAvatarChange,
}: ProfilePhotoModalProps) {
  const [loading, setLoading] = useState(false);
  const [fullName, setName] = useState(name); // Added state for full name
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Handle file selection
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Handle file change
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
    try {
      setLoading(true);
      if (!file) {
        throw new Error("No file selected");
      }
      if (!file.type.startsWith("image/")) {
        throw new Error("Invalid file selected");
      }
      const fileName = `${userId}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage.from("avatars").upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(data.path);
      const publicUrl = urlData.publicUrl;
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);
      if (updateError) throw updateError;
      if (onAvatarChange) onAvatarChange(publicUrl);
      toast({ title: "Avatar updated", description: "Your profile picture has been updated successfully" });
      onClose();
      router.refresh();
    } catch (error: any) {
      toast({ title: "Error updating avatar", description: error.message || "Failed to update avatar", variant: "destructive" });
    } finally {
      setLoading(false);
      setPreviewUrl(null);
    }
  };

  // Handle avatar deletion with confirmation
  const handleDeleteAvatar = async () => {
    if (!avatarUrl) return;
    setShowDeleteConfirm(false);
    try {
      setLoading(true);
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", userId);
      if (updateError) throw updateError;
      toast({ title: "Avatar removed", description: "Your profile picture has been removed" });
      onClose();
      router.refresh();
    } catch (error: any) {
      toast({ title: "Error removing avatar", description: error.message || "Failed to remove avatar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative bg-white/80 dark:bg-zinc-900/80 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-white/30 backdrop-blur-lg"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <h2 className="text-xl font-bold">Update Profile Photo</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Modal Content */}
        <div className="p-6 flex flex-col items-center relative">
          {/* Loading Spinner Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/70 dark:bg-zinc-900/70 flex items-center justify-center z-20 rounded-2xl">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
          />
          <div className="mb-6 relative">
            <div className="rounded-full p-1 bg-gradient-to-br from-blue-400 to-purple-400">
              <Avatar className="h-40 w-40 border-4 border-white shadow-xl">
                <AvatarImage src={previewUrl || avatarUrl || "/placeholder-user.jpg"} alt={name} />
                <AvatarFallback>{getInitials(name)}</AvatarFallback>
              </Avatar>
            </div>
            {previewUrl && !loading && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 px-3 py-1 rounded-full shadow text-xs font-medium text-blue-600 border border-blue-200">
                Preview
              </div>
            )}
          </div>
          <div className="w-full flex flex-col gap-4">
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-full shadow hover:from-blue-600 hover:to-purple-600"
              onClick={handleFileSelect}
              disabled={loading}
            >
              <Camera className="h-5 w-5 mr-2" /> Upload Photo
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center rounded-full border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={!avatarUrl || loading}
            >
              <Trash2 className="h-5 w-5 mr-2" /> Delete Photo
            </Button>
            {showDeleteConfirm && (
              <div className="flex flex-col items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-4 mt-2">
                <span className="text-sm text-red-700">Are you sure you want to delete your profile photo?</span>
                <div className="flex gap-2 mt-1">
                  <Button size="sm" className="bg-red-500 text-white rounded-full" onClick={handleDeleteAvatar} disabled={loading}>Yes, Delete</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(false)} disabled={loading}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
          <div className="text-center mt-6 text-sm text-muted-foreground">
            {loading ? "Uploading..." : "A clear photo helps people recognize you."}
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, typeof window !== "undefined" ? document.body : ({} as HTMLElement));
}
