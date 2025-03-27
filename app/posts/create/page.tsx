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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachmentFile(file);

    if (attachmentType === "image") {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !attachmentFile) return;

    setIsSubmitting(true);

    try {
      let attachmentUrl = null;

      if (attachmentFile) {
        const fileExt = attachmentFile.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from("attachments")
          .upload(fileName, attachmentFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("attachments").getPublicUrl(fileName);

        attachmentUrl = publicUrl;
      }

      const { error: postError } = await supabase.from("posts").insert({
        content,
        author_id: profile?.id,
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
      });

      if (postError) throw postError;

      toast({
        title: "Post created successfully",
      });

      router.push("/feed");
      router.refresh();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Post failed",
        description: "An error occurred while creating your post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <button onClick={() => router.back()} className="p-2">
          <X className="h-6 w-6" />
        </button>
        <Button
          variant="default"
          size="sm"
          className="rounded-full px-6"
          onClick={handleSubmit}
          disabled={isSubmitting || (!content.trim() && !attachmentFile)}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Posting...
            </>
          ) : (
            "Post"
          )}
        </Button>
      </div>

      {/* Content area */}
      <div className="flex-1 p-4">
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} />
            <AvatarFallback>{getInitials(profile?.full_name || "")}</AvatarFallback>
          </Avatar>
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 resize-none border-0 focus-visible:ring-0 p-0 text-lg"
            rows={5}
          />
        </div>

        {attachmentPreview && (
          <div className="relative mb-4">
            <img src={attachmentPreview} alt="Preview" className="rounded-lg max-h-[300px] w-auto" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => {
                setAttachmentFile(null);
                setAttachmentPreview(null);
                setAttachmentType(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Bottom toolbar */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-4">
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
            onChange={handleFileChange}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => handleAttachmentSelect("image")}
          >
            <ImageIcon className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => handleAttachmentSelect("video")}
          >
            <Video className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => handleAttachmentSelect("document")}
          >
            <FileText className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}