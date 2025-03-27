
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setAttachmentFile(file);

    if (attachmentType === "image") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachmentPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAttachmentPreview(file.name);
    }
  };

  const clearAttachment = () => {
    setAttachmentFile(null);
    setAttachmentPreview(null);
    setAttachmentType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !attachmentFile) {
      toast({
        title: "Empty post",
        description: "Please add some text or an attachment to your post",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;
      let videoUrl = null;
      let documentUrl = null;

      if (attachmentFile) {
        const fileExt = attachmentFile.name.split(".").pop();
        const fileName = `${profile?.id || "user"}-${Date.now()}.${fileExt}`;
        let bucket = "";

        if (attachmentType === "image") bucket = "post-images";
        else if (attachmentType === "video") bucket = "post-videos";
        else if (attachmentType === "document") bucket = "post-documents";

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, attachmentFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);

        if (attachmentType === "image") imageUrl = publicUrl;
        else if (attachmentType === "video") videoUrl = publicUrl;
        else if (attachmentType === "document") documentUrl = publicUrl;
      }

      const { error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: profile?.id,
          content: content.trim(),
          image_url: imageUrl,
          video_url: videoUrl,
          document_url: documentUrl,
        });

      if (postError) throw postError;

      toast({
        title: "Post created",
        description: "Your post has been published successfully",
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
    <div className="min-h-screen bg-background">
      <div className="flex flex-col h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 border-b">
          <button onClick={() => router.back()} className="p-2">
            <X className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold">Share</h1>
          <Button
            variant="default"
            size="sm"
            className="rounded-full px-6"
            onClick={handleSubmit}
            disabled={isSubmitting}
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
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} />
              <AvatarFallback>{getInitials(profile?.full_name || "")}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <Textarea
                placeholder={`What's on your mind, ${profile?.full_name?.split(" ")[0] || "User"}?`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px] resize-none border-none shadow-none text-base focus-visible:ring-0 p-0"
              />

              {attachmentPreview && (
                <div className="relative mt-4 rounded-md border p-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/80"
                    onClick={clearAttachment}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  {attachmentType === "image" ? (
                    <div className="relative aspect-video max-h-[300px] overflow-hidden rounded-md">
                      <img
                        src={attachmentPreview}
                        alt="Preview"
                        className="object-contain w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {attachmentType === "video" ? (
                        <Video className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                      <span>{attachmentPreview}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom attachment toolbar */}
        <div className="border-t p-2 flex items-center gap-2">
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

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept={
              attachmentType === "image"
                ? "image/*"
                : attachmentType === "video"
                  ? "video/*"
                  : ".pdf,.doc,.docx,.txt"
            }
          />
        </div>
      </div>
    </div>
  );
}
