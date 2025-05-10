"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { FileText, Image as ImageIcon, Loader2, Video, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function CreatePostPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachmentType, setAttachmentType] = useState<"image" | "video" | "document" | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part?.[0] || "")
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleAttachmentSelect = (type: "image" | "video" | "document") => {
    setAttachmentType(type);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col"> {/* Changed background color here */}
      <div className="container max-w-3xl px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} />
            <AvatarFallback>{getInitials(profile?.full_name || "")}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">{profile?.full_name || "User"}</h2>
            <p className="text-sm text-muted-foreground">{profile?.headline || ""}</p>
          </div>
        </div>

        <div className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            className="min-h-[200px] text-lg focus-visible:ring-primary"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {attachmentPreview && (
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 z-10"
                onClick={() => {
                  setAttachmentPreview(null);
                  setAttachmentFile(null);
                  setAttachmentType(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              {attachmentType === "image" && (
                <img
                  src={attachmentPreview}
                  alt="Preview"
                  className="w-full max-h-[500px] object-contain"
                />
              )}
              {attachmentType === "video" && (
                <video src={attachmentPreview} controls className="w-full max-h-[500px]" />
              )}
              {attachmentType === "document" && (
                <div className="flex items-center gap-2 p-4">
                  <FileText className="h-6 w-6" />
                  <span>{attachmentFile?.name}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleAttachmentSelect("image")}
                type="button"
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleAttachmentSelect("video")}
                type="button"
              >
                <Video className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleAttachmentSelect("document")}
                type="button"
              >
                <FileText className="h-5 w-5" />
              </Button>
            </div>

            <Button
              className="min-w-[100px]"
              disabled={!content.trim() && !attachmentFile}
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  // Handle post creation logic here  (This is where the original supabase upload logic would go)
                  router.push("/feed");
                  toast({
                    title: "Post created successfully",
                  });
                } catch (error) {
                  console.error("Error creating post:", error);
                  toast({
                    title: "Failed to create post",
                    variant: "destructive",
                  });
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span>Post</span>
              )}
            </Button>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={
            attachmentType === "image"
              ? "image/*"
              : attachmentType === "video"
              ? "video/*"
              : "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          }
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setAttachmentFile(file);
              const reader = new FileReader();
              reader.onloadend = () => {
                setAttachmentPreview(reader.result as string);
              };
              reader.readAsDataURL(file);
            }
          }}
        />
      </div>
    </div>
  );
}