"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { FileText, Image, Loader2, Paperclip, Video, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { useRef, useState } from "react";

// Define Profile type based on what's in auth context
type Profile = {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  [key: string]: any;
};

export function PostCreator({ 
  userProfile,
  isLoading = false 
}: { 
  userProfile?: Profile | null;
  isLoading?: boolean;
}) {
  const { user, profile: authProfile } = useAuth();
  const activeProfile = userProfile || authProfile;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-20 w-full" />
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachmentType, setAttachmentType] = useState<"image" | "video" | "document" | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
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

  const handleAttachmentSelect = (type: "image" | "video" | "document") => {
    setAttachmentType(type);

    // Reset file input before clicking to ensure the change event fires even if selecting the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input changed:", event.target.files);
    const file = event.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("Selected file:", file.name, file.type, file.size);

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setAttachmentFile(file);

    // Create preview for images
    if (attachmentType === "image") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachmentPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // For non-images, just show the filename
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

      // Upload attachment if any
      if (attachmentFile) {
        const fileExt = attachmentFile.name.split(".").pop();
        // Ensure activeProfile exists before accessing its id
        const fileName = `${activeProfile?.id || "user"}-${Date.now()}.${fileExt}`;
        let bucket = "";

        if (attachmentType === "image") {
          bucket = "post-images";
        } else if (attachmentType === "video") {
          bucket = "post-videos";
        } else if (attachmentType === "document") {
          bucket = "post-documents";
        }

        console.log(`Uploading to ${bucket} bucket with file name: ${fileName}`);

        // Check if bucket exists first
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some((b) => b.name === bucket);

        if (!bucketExists) {
          console.log(`Bucket ${bucket} doesn't exist, creating it...`);
          await supabase.storage.createBucket(bucket, {
            public: true,
          });
        }

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, attachmentFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw uploadError;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(fileName);

        if (attachmentType === "image") {
          imageUrl = publicUrl;
        } else if (attachmentType === "video") {
          videoUrl = publicUrl;
        } else if (attachmentType === "document") {
          documentUrl = publicUrl;
        }
      }

      // Create post in database
      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: activeProfile?.id,
          content: content.trim(),
          image_url: imageUrl,
          video_url: videoUrl,
          document_url: documentUrl,
        })
        .select();

      if (postError) {
        throw postError;
      }

      // Success
      toast({
        title: "Post created",
        description: "Your post has been published successfully",
      });

      // Reset form
      setContent("");
      clearAttachment();

      // Refresh feed to show new post
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
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={activeProfile?.avatar_url || ""}
              alt={activeProfile?.full_name || "User"}
            />
            <AvatarFallback>{getInitials(activeProfile?.full_name || "")}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4">
            <Textarea
              placeholder={`What's on your mind, ${activeProfile?.full_name?.split(" ")[0] || "User"}?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
            />

            {attachmentPreview && (
              <div className="relative rounded-md border p-3 bg-muted/20">
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
                      alt="Attachment preview"
                      className="object-contain w-full h-full"
                    />
                  </div>
                ) : attachmentType === "video" ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Video className="h-4 w-4" />
                    <span>{attachmentPreview}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{attachmentPreview}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => handleAttachmentSelect("image")}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Photo
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => handleAttachmentSelect("video")}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => handleAttachmentSelect("document")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Document
                </Button>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  accept={
                    attachmentType === "image"
                      ? ".jpg,.jpeg,.png,.gif,.webp,image/*"
                      : attachmentType === "video"
                        ? ".mp4,.mov,.avi,video/*"
                        : ".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  }
                />
              </div>

              <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>Post</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
