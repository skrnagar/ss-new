"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { FileText, Image, Loader2, Paperclip, Video, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { useRef, useState, useCallback, useEffect } from "react";
import debounce from "lodash.debounce";
import imageCompression from "browser-image-compression";

// Define Profile type based on what's in auth context
type Profile = {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  [key: string]: any;
};

interface PostCreatorProps {
  isDialog?: boolean;
  onSuccess?: () => void;
  onOptimisticPost?: (optimisticPost: any) => void;
}

export function PostCreator({ isDialog = false, onSuccess, onOptimisticPost }: PostCreatorProps) {
  const { profile: authProfile } = useAuth();
  const activeProfile = authProfile;

  if (!activeProfile) {
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
  const [isCompressing, setIsCompressing] = useState(false);
  const [attachmentType, setAttachmentType] = useState<"image" | "video" | "document" | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Debounce content updates for autosave/UX, but always use latest content for submit
  const [inputContent, setInputContent] = useState("");
  const debouncedSetContent = useCallback(
    debounce((value: string) => {
      setContent(value);
    }, 300),
    []
  );

  // Keep content in sync with inputContent
  useEffect(() => {
    setContent(inputContent);
  }, [inputContent]);

  // Cleanup: reset isSubmitting if component unmounts
  useEffect(() => {
    return () => {
      setIsSubmitting(false);
    };
  }, []);

  // Compress image before upload
  const compressImage = async (file: File): Promise<File> => {
    if (!file.type.startsWith("image/")) return file;

    setIsCompressing(true);
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      return new File([compressedFile], file.name, { type: file.type });
    } catch (error) {
      return file;
    } finally {
      setIsCompressing(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part?.[0] || "")
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // New: Support multiple images
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (attachmentType === "image") {
      const validFiles = Array.from(files).slice(0, 6); // Limit to 6 images
      const compressedFiles: File[] = [];
      const previews: string[] = [];
      for (const file of validFiles) {
        if (file.size > 10 * 1024 * 1024) continue;
        const compressed = await compressImage(file);
        compressedFiles.push(compressed);
        const reader = new FileReader();
        reader.onload = (e) => {
          previews.push(e.target?.result as string);
          if (previews.length === compressedFiles.length) {
            setImageFiles(compressedFiles);
            setImagePreviews([...previews]);
          }
        };
        reader.readAsDataURL(compressed);
      }
      return;
    }
    const file = files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return;
    const compressedFile = await compressImage(file);
    setAttachmentFile(compressedFile);
    setAttachmentPreview(compressedFile.name);
  };

  const clearAttachment = () => {
    setAttachmentFile(null);
    setAttachmentPreview(null);
    setAttachmentType(null);
    setImageFiles([]);
    setImagePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!inputContent.trim() && !attachmentFile && imageFiles.length === 0) {
      toast({
        title: "Empty post",
        description: "Please add some text or an attachment to your post",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      let imageUrls: string[] = [];
      let videoUrl = null;
      let documentUrl = null;

      // Upload images if any
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${activeProfile?.id || "user"}-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
          const bucket = "post-images";
          const { data: buckets } = await supabase.storage.listBuckets();
          const bucketExists = buckets?.some((b) => b.name === bucket);
          if (!bucketExists) {
            await supabase.storage.createBucket(bucket, { public: true });
          }
          const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
              cacheControl: "3600",
              upsert: false,
              contentType: file.type,
            });
          if (uploadError) continue;
          const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
          imageUrls.push(publicUrl);
        }
      }
      if (attachmentFile && attachmentType === "video") {
        const fileExt = attachmentFile.name.split(".").pop();
        const fileName = `${activeProfile?.id || "user"}-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const bucket = "post-videos";
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some((b) => b.name === bucket);
        if (!bucketExists) {
          await supabase.storage.createBucket(bucket, { public: true });
        }
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, attachmentFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: attachmentFile.type,
          });
        if (uploadError) {
          throw uploadError;
        }
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
        videoUrl = publicUrl;
      }
      if (attachmentFile && attachmentType === "document") {
        const fileExt = attachmentFile.name.split(".").pop();
        const fileName = `${activeProfile?.id || "user"}-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const bucket = "post-documents";
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some((b) => b.name === bucket);
        if (!bucketExists) {
          await supabase.storage.createBucket(bucket, { public: true });
        }
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, attachmentFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: attachmentFile.type,
          });
        if (uploadError) {
          throw uploadError;
        }
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
        documentUrl = publicUrl;
      }

      const newPost = {
        user_id: activeProfile?.id,
        content: inputContent.trim(),
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        video_url: videoUrl,
        document_url: documentUrl,
        created_at: new Date().toISOString(),
      };

      // Optimistically add the post to the feed
      if (onOptimisticPost) {
        onOptimisticPost({ ...newPost, id: `optimistic-${Date.now()}` });
      }

      // Create post in database
      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert([newPost])
        .select("*, profiles(*)")
        .single();

      if (postError) {
        // Remove optimistic post if API fails
        if (onOptimisticPost) {
          onOptimisticPost(null); // Signal to remove the optimistic post
        }
        throw postError;
      }

      // Success
      toast({
        title: "Post created",
        description: "Your post has been published successfully",
      });

      // Reset form
      setInputContent("");
      clearAttachment();

      // Call onSuccess with the new post data for immediate UI update
      if (onSuccess) {
        onSuccess();
      }

      // Navigate to feed page and refresh data
      router.push("/feed");
      router.refresh();
    } catch (error) {
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
    <div className="flex flex-col gap-3">
      <div className="flex-1 space-y-3">
        <Textarea
          placeholder={`What's on your mind, ${activeProfile?.full_name?.split(" ")[0] || "User"}?`}
          value={inputContent}
          onChange={(e) => {
            setInputContent(e.target.value);
            debouncedSetContent(e.target.value);
          }}
          className="min-h-[120px] md:min-h-[250px] resize-none text-sm md:text-base"
        />

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-auto rounded-md border p-3 bg-muted/20">
            {imagePreviews.map((src, idx) => (
              <div key={idx} className="relative aspect-video rounded-md overflow-hidden flex items-center justify-center">
                <img src={src} alt={`Attachment preview ${idx + 1}`} className="object-contain w-full h-full" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/80"
                  onClick={() => {
                    setImageFiles(files => files.filter((_, i) => i !== idx));
                    setImagePreviews(previews => previews.filter((_, i) => i !== idx));
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {attachmentPreview && (
          <div className="relative rounded-md border p-3 bg-muted/20 max-h-64 overflow-auto">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/80"
              onClick={clearAttachment}
            >
              <X className="h-4 w-4" />
            </Button>

            {attachmentType === "image" ? (
              <div className="relative aspect-video max-h-56 overflow-auto rounded-md flex items-center justify-center">
                <img
                  src={attachmentPreview}
                  alt="Attachment preview"
                  className="object-contain w-full h-full"
                />
              </div>
            ) : attachmentType === "video" ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Video className="h-4 w-4" />
                <span className="truncate max-w-[200px]">{attachmentPreview}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="truncate max-w-[200px]">{attachmentPreview}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1 md:gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-8 px-2 md:px-3"
              onClick={() => handleAttachmentSelect("image")}
            >
              <Image className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Photo</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-8 px-2 md:px-3"
              onClick={() => handleAttachmentSelect("video")}
            >
              <Video className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Video</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-8 px-2 md:px-3"
              onClick={() => handleAttachmentSelect("document")}
            >
              <FileText className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Document</span>
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

          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting || isCompressing}
            className="w-full md:w-auto"
          >
            {isSubmitting || isCompressing ? (
              <>
                <Loader2 className="h-4 w-8 mr-2 animate-spin" />
                {isCompressing ? "Compressing..." : "Posting..."}
              </>
            ) : (
              <>Post</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
