"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea"; // Added for comments
import { useToast } from "@/hooks/use-toast";
import { usePostOperations } from "@/hooks/use-post-operations";
import { supabase } from "@/lib/supabase";
import { formatTextWithLinks } from "@/lib/link-formatter";
import { formatDistanceToNow } from "date-fns";
import { LinkPreview } from "@/components/link-preview";
import { InlineLoader } from "@/components/ui/logo-loder";
import {
  Clock,
  FileText,
  MessageSquare,
  MoreHorizontal,
  Send,
  Share2,
  ThumbsUp,
  Heart,
  Bookmark,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { memo, useEffect, useState } from "react";
import ModernDocumentViewer from "@/components/modern-document-viewer";

// Define the PostItemProps interface
interface PostItemProps {
  post: {
    id: string;
    user_id: string;
    content?: string;
    image_url?: string;
    video_url?: string;
    document_url?: string;
    link_preview?: {
      title: string;
      description: string;
      image: string;
      url: string;
      domain: string;
    };
    created_at: string;
    updated_at?: string;
    profile?: {
      id: string;
      username?: string;
      full_name?: string;
      avatar_url?: string;
      headline?: string;
      position?: string;
      company?: string;
    };
    image_urls?: string[]; // Added for multiple images
  };
  currentUser?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  } | null;
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: (postId: string, updatedContent: string) => void;
}

function ProfileLink({ profile, children, className = "" }: { profile: { username?: string; id?: string }; children: React.ReactNode; className?: string }) {
  const href = profile?.username ? `/profile/${profile.username}` : profile?.id ? `/profile/${profile.id}` : "#";
  return (
    <Link href={href} className={className} prefetch={false}>
      {children}
    </Link>
  );
}

const PostItem = memo(function PostItem({ post, currentUser, onPostDeleted, onPostUpdated }: PostItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || "");
  const [likes, setLikes] = useState<any[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentContent, setCommentContent] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { deletePost, updatePost, isDeleting, isUpdating } = usePostOperations();

  const isAuthor = currentUser && post.user_id === currentUser.id;
  const MAX_CONTENT_LENGTH = 300;

  useEffect(() => {
    // Check if current user has liked the post
    if (currentUser?.id) {
      checkLikeStatus();
    }

    // Fetch likes count
    fetchLikes();

    // Fetch comments count on mount
    fetchComments();
  }, [post.id, currentUser?.id]);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part?.[0] || "")
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return "recently";
    }
  };

  const checkLikeStatus = async () => {
    if (!currentUser) return;

    try {
      // Fix the query format by using proper AND logic between conditions
      const { data, error } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", post.id)
        .eq("user_id", currentUser.id);

      // Check if any likes were found
      if (data && data.length > 0) {
        setIsLiked(true);
      } else {
        setIsLiked(false);
      }

      if (error) {
        toast({
          title: "Error checking like status",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      // silent
    }
  };

  const fetchLikes = async () => {
    try {
      const { data, error } = await supabase.from("likes").select("*").eq("post_id", post.id);

      if (error) throw error;

      setLikes(data || []);
    } catch (error) {
      // silent
    }
  };

  const fetchComments = async () => {
    setIsLoadingComments(true);

    try {
      // Simplify the query to avoid join issues
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // If we have comments, fetch the user profiles separately
      if (data && data.length > 0) {
        // Get unique user IDs from comments
        const userIds = [...new Set(data.map((comment) => comment.user_id))];

        // Fetch profiles for these users
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .in("id", userIds);

        if (profilesError) {
          // silent
        } else {
          // Create a map of user_id to profile data
          const profileMap = (profiles || []).reduce<Record<string, any>>((map, profile) => {
            map[profile.id] = profile;
            return map;
          }, {});

          // Attach profile data to each comment
          data.forEach((comment) => {
            comment.profiles = profileMap[comment.user_id] || null;
          });
        }
      }

      setComments(data || []);
    } catch (error) {
      toast({
        title: "Error loading comments",
        description: "Failed to load comments. Please try again.",
        variant: "destructive",
      });
      // Set empty array to prevent undefined errors
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!currentUser || !currentUser.id) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to like posts",
        variant: "default",
      });
      return;
    }

    try {
      // Optimistically update UI immediately
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);

      if (newIsLiked) {
        const tempLike = { id: `temp-${Date.now()}`, post_id: post.id, user_id: currentUser.id };
        setLikes((prev) => [...prev, tempLike]);

        const { data, error } = await supabase
          .from("likes")
          .insert({
            post_id: post.id,
            user_id: currentUser.id,
          })
          .select("id")
          .single();

        if (error) {
          // Revert optimistic update on error
          setIsLiked(false);
          setLikes((prev) => prev.filter((like) => like.id !== tempLike.id));
          throw error;
        }

        // Update temporary ID with real one
        setLikes((prev) =>
          prev.map((like) => (like.id === tempLike.id ? { ...like, id: data.id } : like))
        );
      } else {
        const likesToRemove = likes.filter((like) => like.user_id === currentUser.id);
        setLikes((prev) => prev.filter((like) => like.user_id !== currentUser.id));

        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", currentUser.id);

        if (error) {
          // Revert optimistic update on error
          setIsLiked(true);
          setLikes((prev) => [...prev, ...likesToRemove]);
          throw error;
        }
      }
    } catch (error: any) {
      toast({
        title: "Action failed",
        description: error.message || "Unable to process your like",
        variant: "destructive",
      });
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedContent = commentContent.trim();

    if (!trimmedContent) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (!currentUser || !currentUser.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingComment(true);

    try {
      // First get the user's profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (profileError) throw profileError;

      // Insert comment in database
      const { data: newComment, error } = await supabase
        .from("comments")
        .insert({
          content: trimmedContent,
          post_id: post.id,
          user_id: currentUser.id,
        })
        .select("*")
        .single();

      if (error) throw error;

      // Combine comment with profile data
      const commentWithProfile = {
        ...newComment,
        profiles: profile,
      };

      // Update comments state with new comment
      setComments((prev) => [commentWithProfile, ...prev]);
      setCommentContent("");

      toast({
        title: "Success",
        description: "Your comment has been posted!",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Comment failed",
        description: error.message || "Could not post your comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase.from("comments").delete().eq("id", commentId);

      if (error) throw error;

      setComments(comments.filter((comment) => comment.id !== commentId));

      toast({
        title: "Comment deleted",
        description: "Your comment has been removed",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting the comment",
        variant: "destructive",
      });
    }
  };

  const handleEditPost = () => {
    if (!isAuthor) {
      toast({
        title: "Permission denied",
        description: "You can only edit your own posts",
        variant: "destructive",
      });
      return;
    }
    setIsEditing(true);
    setEditContent(post.content || "");
  };

  const handleSaveEdit = async () => {
    if (!currentUser?.id) return;

    const result = await updatePost(post.id, editContent, post.user_id, currentUser.id);
    
    if (result.success) {
      // Update the local post content
      post.content = editContent.trim();
      setIsEditing(false);
      
      // Notify parent component about the update
      if (onPostUpdated) {
        onPostUpdated(post.id, editContent.trim());
      }
      
      // Force a page refresh to update the UI
      router.refresh();
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(post.content || "");
  };

  // Handle keyboard shortcuts for edit mode
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const handleDeletePost = async () => {
    console.log("handleDeletePost called with post ID:", post.id);
    if (!currentUser?.id) {
      console.log("No current user found");
      return;
    }

    console.log("Starting delete operation...");
    const result = await deletePost(post.id, post.user_id, currentUser.id);
    console.log("Delete result:", result);
    
    if (result.success) {
      console.log("Delete successful, updating UI...");
      // Notify parent component about the deletion
      if (onPostDeleted) {
        onPostDeleted(post.id);
      }
      // Force a page refresh to update the UI
      router.refresh();
    } else {
      console.log("Delete failed:", result.error);
    }
  };

  const handleToggleComments = () => {
    if (!showComments) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  const shouldTruncate = post.content && post.content.length > MAX_CONTENT_LENGTH;
  const displayContent =
    shouldTruncate && !isExpanded
      ? `${post.content?.substring(0, MAX_CONTENT_LENGTH) || ""}...`
      : post.content || "";

  const getStorageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    // Handle already formed URLs
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-images/${imageUrl}`;
  };

  const isImageUrl = (url: string | null): boolean => {
    if (!url) return false;
    const ext = url.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "");
  };

  const uploadMedia = async (file: File) => {
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const contentType =
      fileExt === "png"
        ? "image/png"
        : fileExt === "jpg" || fileExt === "jpeg"
          ? "image/jpeg"
          : fileExt === "webp"
            ? "image/webp"
            : fileExt === "gif"
              ? "image/gif"
              : fileExt === "mp4"
                ? "video/mp4"
                : fileExt === "webm"
                  ? "video/webm"
                  : "application/octet-stream";

    const timestamp = Date.now();
    const fileName = `${post.id}/${timestamp}-${file.name}`;
    try {
      const { data, error } = await supabase.storage.from("post-images").upload(fileName, file, {
        contentType: contentType,
        cacheControl: "3600",
        upsert: true,
      });
      if (error) throw error;
      return fileName; // Return the uploaded file name
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Could not upload media. Please try again later.",
        variant: "destructive",
      });
      return null; // Indicate failure
    }
  };

  if (!post?.profile) {
    return null; // Don't render anything while loading
  }

  return (
    <Card className="mb-6 bg-white shadow-sm rounded-xl transition-shadow hover:shadow-md border border-gray-200">
      <CardContent className="pt-6 pb-2 px-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-4">
            <ProfileLink profile={post.profile}>
              <Avatar className="h-12 w-12">
                <div className="h-full w-full rounded-full p-0.5 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
                  <div className="h-full w-full rounded-full bg-white p-0.5">
                    <AvatarImage src={post.profile?.avatar_url} alt={post.profile?.full_name} className="object-cover rounded-full" />
                    <AvatarFallback className="rounded-full">{getInitials(post.profile?.full_name || "User")}</AvatarFallback>
                  </div>
                </div>
              </Avatar>
            </ProfileLink>
            <div>
              <ProfileLink profile={post.profile} className="font-semibold text-lg text-gray-900 hover:underline">
                {post.profile?.full_name || "Anonymous User"}
              </ProfileLink>
              <p className="text-sm text-muted-foreground font-medium">
                {post.profile?.headline || post.profile?.position}
                {post.profile?.company && <span className="ml-1">@ {post.profile?.company}</span>}
              </p>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Clock className="h-3 w-3 mr-1" />
                <span>{formatDate(post.created_at)}</span>
                {post.updated_at && post.updated_at !== post.created_at && (
                  <span className="ml-1 text-gray-400">(edited)</span>
                )}
              </div>
            </div>
          </div>
          {isAuthor && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEditPost}>
                  Edit Post
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => {
                    console.log("Delete button clicked, opening dialog");
                    setShowDeleteDialog(true);
                  }}
                >
                  Delete Post
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        </div>
        {/* Post content */}
        <div className="space-y-4">
          {isEditing ? (
            <div className="space-y-3">
                              <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  placeholder="Edit your post..."
                  className="min-h-[100px] resize-none"
                  disabled={isUpdating}
                />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveEdit}
                  disabled={isUpdating || !editContent.trim()}
                  size="sm"
                >
                  {isUpdating ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            post.content && (
              <div>
                <p className="whitespace-pre-line text-base text-gray-800 leading-relaxed">
                  {formatTextWithLinks(displayContent, (username) => {
                    // Handle user mention click - could add analytics or notifications here
                    console.log(`User mentioned: ${username}`);
                  })}
                </p>
                {shouldTruncate && (
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm mt-1"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? "Show less" : "Show more"}
                  </Button>
                )}
              </div>
            )
          )}
          {/* Media attachments (images, video, document) */}
          {/* Single Image Full Width */}
          {Array.isArray(post.image_urls) && post.image_urls.length === 1 && (
            <div className="mt-3 rounded-md overflow-hidden w-full">
              <div className="relative w-full aspect-video bg-muted flex items-center justify-center">
                <Image
                  src={post.image_urls[0]}
                  alt="Post image"
                  fill
                  className="object-contain rounded-md"
                  loading="lazy"
                  quality={80}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.jpg";
                  }}
                />
              </div>
            </div>
          )}
          {/* Multiple Images Grid */}
          {Array.isArray(post.image_urls) && post.image_urls.length > 1 && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 rounded-md overflow-hidden w-full">
              {post.image_urls.map((src, idx) => (
                <div key={idx} className="relative aspect-video bg-muted flex items-center justify-center">
                  <Image
                    src={src}
                    alt={`Post image ${idx + 1}`}
                    fill
                    className="object-contain rounded-md"
                    loading="lazy"
                    quality={80}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.jpg";
                    }}
                  />
                </div>
              ))}
            </div>
          )}
          {/* Video */}
          {post.video_url && (
            <div className="mt-3 rounded-md overflow-hidden w-full">
              <video
                src={post.video_url}
                controls
                className="w-full h-auto rounded-md bg-black"
                preload="metadata"
                style={{ maxHeight: 400 }}
              />
            </div>
          )}
          {/* Document (PDF/DOCX) */}
          {post.document_url && (
            <div className="mt-3 rounded-md overflow-hidden w-full">
              <ModernDocumentViewer
                url={post.document_url}
                type={post.document_url.endsWith(".pdf") ? "pdf" : "docx"}
                fileName={post.document_url.split("/").pop()}
              />
            </div>
          )}

          {/* Link Preview */}
          {post.link_preview && (
            <div className="mt-3">
              <a
                href={post.link_preview.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex">
                  {post.link_preview.image && (
                    <div className="w-24 h-24 flex-shrink-0">
                      <img
                        src={post.link_preview.image}
                        alt={post.link_preview.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 p-3 min-w-0">
                    <div className="text-xs text-gray-500 mb-1">{post.link_preview.domain}</div>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                      {post.link_preview.title}
                    </h3>
                    {post.link_preview.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {post.link_preview.description}
                      </p>
                    )}
                  </div>
                </div>
              </a>
            </div>
          )}

          {/* Single Image (legacy) */}
          {post.image_url && !post.image_urls && (
            <div className="mt-3 rounded-md overflow-hidden">
              <div className="relative w-full max-h-[500px] aspect-video">
                <Image
                  src={getStorageUrl(post.image_url) || "/placeholder.jpg"}
                  alt="Post attachment"
                  fill
                  className="object-cover rounded-md"
                  loading="lazy"
                  quality={80}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.jpg";
                  }}
                />
              </div>
            </div>
          )}

        </div>
      </CardContent>
      <div className="border-t border-gray-100 px-6 py-3 flex flex-col gap-2">
        {/* Action buttons */}
        <div className="flex justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            className={`text-muted-foreground font-medium transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 rounded-lg ${
              isLiked 
                ? "text-blue-600 bg-blue-50 hover:bg-blue-100" 
                : "hover:bg-gray-50"
            }`}
            onClick={handleLikeToggle}
          >
            <Heart className={`h-4 w-4 md:mr-2 ${isLiked ? "fill-blue-600" : ""}`} />
            <span className="hidden md:inline font-medium">{isLiked ? "Liked" : "Like"}</span>
            {likes.length > 0 && (
              <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
                {likes.length}
              </span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`text-muted-foreground font-medium transition-all duration-200 hover:bg-green-50 hover:text-green-600 rounded-lg ${
              showComments 
                ? "text-green-600 bg-green-50 hover:bg-green-100" 
                : "hover:bg-gray-50"
            }`}
            onClick={handleToggleComments}
          >
            <svg className={`h-4 w-4 md:mr-2 ${showComments ? "fill-green-600" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="hidden md:inline font-medium">Comment</span>
            {comments.length > 0 && (
              <span className="ml-1 text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-medium">
                {comments.length}
              </span>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground font-medium hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all duration-200">
                <svg className="h-4 w-4 md:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                <span className="hidden md:inline font-medium">Share</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem
                onClick={() => {
                  window.open(
                    `https://twitter.com/intent/tweet?text=Check out this post from Safety Shaper&url=${window.location.origin}/posts/${post.id}`,
                    "_blank"
                  );
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share on X
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}/posts/${post.id}`,
                    "_blank"
                  );
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 12-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
                </svg>
                Share on Facebook
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.origin}/posts/${post.id}`,
                    "_blank"
                  );
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                Share on LinkedIn
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  const url = `${window.location.origin}/posts/${post.id}`;
                  await navigator.clipboard.writeText(url);
                  toast({
                    title: "Link copied",
                    description: "Post link copied to clipboard",
                  });
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href={`/messages?share=${post.id}`} className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Send as Message
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Comments section */}
      {showComments && (
        <div className="border-t border-gray-100 bg-gray-50/30 px-6 py-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Comment form */}
          <form onSubmit={handleCommentSubmit} className="flex items-start gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <div className="h-full w-full rounded-full p-0.5 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
                <div className="h-full w-full rounded-full bg-white p-0.5">
                  <AvatarImage src={currentUser?.avatar_url} alt={currentUser?.full_name} className="object-cover rounded-full" />
                  <AvatarFallback className="rounded-full">{getInitials(currentUser?.full_name || "User")}</AvatarFallback>
                </div>
              </div>
            </Avatar>
            <div className="flex-1 relative">
              <Textarea
                placeholder="Write a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="min-h-[60px] pr-12 resize-none w-full border-gray-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                maxLength={500}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  {commentContent.length}/500
                </span>
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                  disabled={isSubmittingComment || !commentContent.trim()}
                >
                  {isSubmittingComment ? (
                    <InlineLoader size="sm" variant="glitch" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Comments list */}
          {isLoadingComments ? (
            <div className="flex items-center justify-center py-6">
              <InlineLoader size="sm" variant="line" />
              <span className="ml-2 text-sm text-muted-foreground">Loading comments...</span>
            </div>
          ) : (
            <>
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-muted-foreground">No comments yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Be the first to share your thoughts!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment, index) => (
                    <div
                      key={comment.id || `temp-comment-${Date.now()}-${Math.random()}`}
                      className="flex items-start gap-3 group animate-in slide-in-from-top-2 duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <div className="h-full w-full rounded-full p-0.5 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
                          <div className="h-full w-full rounded-full bg-white p-0.5">
                            <AvatarImage
                              src={
                                comment.profiles?.avatar_url ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.profiles?.full_name || "User")}&size=40&background=random`
                              }
                              alt={comment.profiles?.full_name}
                              className="object-cover rounded-full"
                            />
                            <AvatarFallback className="rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                              {getInitials(comment.profiles?.full_name || "User")}
                            </AvatarFallback>
                          </div>
                        </div>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <ProfileLink profile={comment.profiles}>
                                <Link
                                  href={`/profile/${comment.profiles?.username || comment.profiles?.id || ""}`}
                                  className="font-semibold text-sm text-gray-900 hover:text-primary transition-colors"
                                >
                                  {comment.profiles?.full_name || "Anonymous User"}
                                </Link>
                              </ProfileLink>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                            </div>
                            {currentUser && comment.user_id === currentUser.id && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem className="text-sm">
                                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-sm text-red-600 focus:text-red-600"
                                    onClick={() => handleDeleteComment(comment.id)}
                                  >
                                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {formatTextWithLinks(comment.content, (username) => {
                              // Handle user mention click in comments
                              console.log(`User mentioned in comment: ${username}`);
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 z-[9999]" 
            onClick={() => setShowDeleteDialog(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          {/* Modal */}
          <div 
            className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl pointer-events-auto">
              <h3 className="text-lg font-semibold mb-2">Delete Post</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this post? This action cannot be undone and will also remove all likes and comments associated with this post.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    console.log("Delete confirmed, calling handleDeletePost");
                    setShowDeleteDialog(false);
                    handleDeletePost();
                  }}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? "Deleting..." : "Delete Post"}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
});

export default PostItem;
