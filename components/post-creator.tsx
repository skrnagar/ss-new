"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { FileText, Image, Paperclip, Video, X, Sparkles } from "lucide-react";
import { InlineLoader } from "@/components/ui/logo-loder";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { useRef, useState, useCallback, useEffect } from "react";
import debounce from "lodash.debounce";
import imageCompression from "browser-image-compression";
import { UserMentionSuggestions } from "@/components/user-mention-suggestions";
import { LinkPreview } from "@/components/link-preview";

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
  
  // User mention state
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  
  // Link preview state
  const [detectedUrl, setDetectedUrl] = useState<string | null>(null);
  const [showLinkPreview, setShowLinkPreview] = useState(false);
  const [removedLinkPreview, setRemovedLinkPreview] = useState(false);
  const [linkPreviewData, setLinkPreviewData] = useState<any>(null);
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

  // Handle user mention detection
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    setInputContent(value);
    debouncedSetContent(value);
    setCursorPosition(cursorPos);

    // Check for @ symbol to show mention suggestions
    const beforeCursor = value.substring(0, cursorPos);
    const mentionMatch = beforeCursor.match(/@([a-zA-Z0-9_]*)$/);
    
    if (mentionMatch) {
      setShowMentionSuggestions(true);
      setMentionQuery(mentionMatch[1]);
    } else {
      setShowMentionSuggestions(false);
      setMentionQuery("");
    }

    // Check for URLs to show link preview
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = value.match(urlRegex);
    
    if (urls && urls.length > 0 && !removedLinkPreview) {
      const lastUrl = urls[urls.length - 1];
      setDetectedUrl(lastUrl);
      setShowLinkPreview(true);
    } else {
      setShowLinkPreview(false);
      setDetectedUrl(null);
    }
  };

  // Handle user mention selection
  const handleUserMentionSelect = (username: string) => {
    const beforeMention = inputContent.substring(0, cursorPosition).replace(/@[a-zA-Z0-9_]*$/, '');
    const afterMention = inputContent.substring(cursorPosition);
    const newContent = beforeMention + '@' + username + ' ' + afterMention;
    
    setInputContent(newContent);
    debouncedSetContent(newContent);
    setShowMentionSuggestions(false);
    setMentionQuery("");
  };

  const handleMentionSuggestionsClose = () => {
    setShowMentionSuggestions(false);
    setMentionQuery("");
  };

  const handleLinkPreviewClose = () => {
    setShowLinkPreview(false);
    setRemovedLinkPreview(true);
    setLinkPreviewData(null);
  };

  const handleLinkPreviewRemove = () => {
    setShowLinkPreview(false);
    setRemovedLinkPreview(true);
    setLinkPreviewData(null);
    // Remove the URL from the content
    if (detectedUrl) {
      const newContent = inputContent.replace(detectedUrl, '').trim();
      setInputContent(newContent);
      debouncedSetContent(newContent);
    }
  };

  const handleLinkPreviewData = (data: any) => {
    setLinkPreviewData(data);
  };

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
        link_preview: linkPreviewData && !removedLinkPreview ? linkPreviewData : null,
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
      setShowLinkPreview(false);
      setDetectedUrl(null);
      setRemovedLinkPreview(false);

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
    <div className="flex flex-col gap-4">
      <div className="flex-1 space-y-4">
        {/* Enhanced Textarea with Modern Styling */}
        <div className="relative">
          {/* Formatting Toolbar */}
          <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded-lg">
            <button
              type="button"
              onClick={() => {
                const textarea = document.querySelector('textarea');
                if (textarea) {
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const selectedText = inputContent.substring(start, end);
                  const newText = inputContent.substring(0, start) + `**${selectedText}**` + inputContent.substring(end);
                  setInputContent(newText);
                  debouncedSetContent(newText);
                }
              }}
              className="px-3 py-1 text-sm font-bold bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => {
                const textarea = document.querySelector('textarea');
                if (textarea) {
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const selectedText = inputContent.substring(start, end);
                  const newText = inputContent.substring(0, start) + `#${selectedText}` + inputContent.substring(end);
                  setInputContent(newText);
                  debouncedSetContent(newText);
                }
              }}
              className="px-3 py-1 text-sm text-blue-600 font-bold bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              #
            </button>
          </div>
          
          <Textarea
            placeholder={`What's on your mind, ${activeProfile?.full_name?.split(" ")[0] || "User"}?`}
            value={inputContent}
            onChange={handleInputChange}
            className="min-h-[140px] md:min-h-[250px] resize-none text-base md:text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400 leading-relaxed"
          />
          {/* Character Counter */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {inputContent.length}/500
          </div>
          
          {/* User Mention Suggestions */}
          {showMentionSuggestions && (
            <UserMentionSuggestions
              query={mentionQuery}
              onSelectUser={handleUserMentionSelect}
              onClose={handleMentionSuggestionsClose}
            />
          )}
        </div>

        {/* Link Preview */}
        {showLinkPreview && detectedUrl && (
          <div className="mt-3 mb-3">
            <LinkPreview
              url={detectedUrl}
              onClose={handleLinkPreviewClose}
              onRemove={handleLinkPreviewRemove}
              onData={handleLinkPreviewData}
            />
          </div>
        )}
        


        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-auto rounded-xl border border-gray-200/50 p-4 bg-gradient-to-br from-gray-50/50 to-white/50">
            {imagePreviews.map((src, idx) => (
              <div key={idx} className="relative aspect-video rounded-lg overflow-hidden flex items-center justify-center group shadow-sm">
                <img src={src} alt={`Attachment preview ${idx + 1}`} className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all duration-200"
                  onClick={() => {
                    setImageFiles(files => files.filter((_, i) => i !== idx));
                    setImagePreviews(previews => previews.filter((_, i) => i !== idx));
                  }}
                >
                  <X className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {attachmentPreview && (
          <div className="relative rounded-xl border border-gray-200/50 p-4 bg-gradient-to-br from-gray-50/50 to-white/50 max-h-64 overflow-auto shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 h-7 w-7 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all duration-200"
              onClick={clearAttachment}
            >
              <X className="h-4 w-4 text-gray-600" />
            </Button>

            {attachmentType === "image" ? (
              <div className="relative aspect-video max-h-56 overflow-auto rounded-lg flex items-center justify-center">
                <img
                  src={attachmentPreview}
                  alt="Attachment preview"
                  className="object-cover w-full h-full rounded-lg"
                />
              </div>
            ) : attachmentType === "video" ? (
              <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Video className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{attachmentPreview}</p>
                  <p className="text-xs text-gray-500">Video file</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{attachmentPreview}</p>
                  <p className="text-xs text-gray-500">Document file</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Action Buttons */}
        <div className="space-y-4">
          {/* Attachment Buttons */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-blue-200/50 text-blue-700 hover:text-blue-800 transition-all duration-200"
              onClick={() => handleAttachmentSelect("image")}
            >
              <Image className="h-5 w-5 mr-2" />
              <span className="font-medium">Photo</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border border-red-200/50 text-red-700 hover:text-red-800 transition-all duration-200"
              onClick={() => handleAttachmentSelect("video")}
            >
              <Video className="h-5 w-5 mr-2" />
              <span className="font-medium">Video</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200/50 text-green-700 hover:text-green-800 transition-all duration-200"
              onClick={() => handleAttachmentSelect("document")}
            >
              <FileText className="h-5 w-5 mr-2" />
              <span className="font-medium">Document</span>
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

          {/* Post Button */}
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting || isCompressing || !inputContent.trim()}
            className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
                            {isSubmitting || isCompressing ? (
                  <>
                    <InlineLoader size="sm" variant="bounce" className="mr-2" />
                    {isCompressing ? "Compressing..." : "Posting..."}
                  </>
                ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Share Post
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
