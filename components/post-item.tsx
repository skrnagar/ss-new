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
import { Textarea } from "@/components/ui/textarea"; // Added for comments
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import {
  Clock,
  FileText,
  MessageSquare,
  MoreHorizontal,
  Send,
  Share2,
  ThumbsUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { memo, useEffect, useState } from "react";

// Define the PostItemProps interface
interface PostItemProps {
  post: {
    id: string;
    user_id: string;
    content?: string;
    image_url?: string;
    video_url?: string;
    document_url?: string;
    created_at: string;
    profile?: {
      id: string;
      username?: string;
      full_name?: string;
      avatar_url?: string;
      headline?: string;
      position?: string;
      company?: string;
    };
  };
  currentUser?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  } | null;
}

const PostItem = memo(function PostItem({ post, currentUser }: PostItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [likes, setLikes] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [commentContent, setCommentContent] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const isAuthor = currentUser && post.user_id === currentUser.id;
  const MAX_CONTENT_LENGTH = 300;

  useEffect(() => {
    // Debug log to check current user status
    console.log("Current user in post item:", currentUser ? "Logged in" : "Not logged in");

    // Check if current user has liked the post
    if (currentUser && currentUser.id) {
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
        console.error("Error checking like status:", error);
        toast({
          title: "Error checking like status",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  };

  const fetchLikes = async () => {
    try {
      const { data, error } = await supabase.from("likes").select("*").eq("post_id", post.id);

      if (error) throw error;

      setLikes(data || []);
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  const fetchComments = async () => {
    setIsLoadingComments(true);

    try {
      console.log("Fetching comments for post:", post.id);

      // Simplify the query to avoid join issues
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      console.log("Comments fetched:", data?.length || 0);

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
          console.error("Error fetching profiles:", profilesError);
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
      console.error("Error fetching comments:", error);
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
          setLikes((prev) => prev.filter(like => like.id !== tempLike.id));
          throw error;
        }

        // Update temporary ID with real one
        setLikes((prev) => prev.map(like => 
          like.id === tempLike.id ? { ...like, id: data.id } : like
        ));
      } else {
        const likesToRemove = likes.filter(like => like.user_id === currentUser.id);
        setLikes((prev) => prev.filter(like => like.user_id !== currentUser.id));

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
      console.error("Error toggling like:", error);
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
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
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
        .select('*')
        .single();

      if (error) throw error;

      // Combine comment with profile data
      const commentWithProfile = {
        ...newComment,
        profiles: profile
      };

      // Update comments state with new comment
      setComments(prev => [commentWithProfile, ...prev]);
      setCommentContent("");

      toast({
        title: "Success",
        description: "Your comment has been posted!",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Error submitting comment:", error);
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
      console.error("Error deleting comment:", error);
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting the comment",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async () => {
    if (!isAuthor) return;

    setIsDeleting(true);

    try {
      const { error } = await supabase.from("posts").delete().eq("id", post.id);

      if (error) throw error;

      toast({
        title: "Post deleted",
        description: "Your post has been removed successfully",
      });

      router.refresh();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting the post",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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
      : post.content;

  const getStorageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    // Handle already formed URLs
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-images/${imageUrl}`;
  };

  const uploadMedia = async (file: File) => {
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const contentType = fileExt === 'png' ? 'image/png' :
                       fileExt === 'jpg' || fileExt === 'jpeg' ? 'image/jpeg' :
                       fileExt === 'webp' ? 'image/webp' :
                       fileExt === 'gif' ? 'image/gif' :
                       fileExt === 'mp4' ? 'video/mp4' :
                       fileExt === 'webm' ? 'video/webm' : 'application/octet-stream';

    const timestamp = Date.now();
    const fileName = `${post.id}/${timestamp}-${file.name}`;
    try {
      const { data, error } = await supabase.storage
        .from("post-images")
        .upload(fileName, file, {
          contentType: contentType,
          cacheControl: "3600",
          upsert: true
        });
      if (error) throw error;
      return fileName; // Return the uploaded file name
    } catch (error) {
      console.error("Error uploading media:", error);
      toast({
        title: "Upload failed",
        description: "Could not upload media. Please try again later.",
        variant: "destructive",
      });
      return null; // Indicate failure
    }
  };


  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3">
            <Link href={`/profile/${post.profile?.username || "#"}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.profile?.avatar_url} alt={post.profile?.full_name} />
                <AvatarFallback>{getInitials(post.profile?.full_name || "User")}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link
                href={`/profile/${post.profile?.username || "#"}`}
                className="font-medium hover:underline"
              >
                {post.profile?.full_name || "Anonymous User"}
              </Link>
              <p className="text-sm text-muted-foreground">
                {post.profile?.headline || post.profile?.position}
                {post.profile?.position && post.profile?.company && " at "}
                {post.profile?.company}
              </p>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Clock className="h-3 w-3 mr-1" />
                <span>{formatDate(post.created_at)}</span>
              </div>
            </div>
          </div>

          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit Post</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={handleDeletePost}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Post"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Post content */}
        <div className="space-y-4">
          {post.content && (
            <div>
              <p className="whitespace-pre-line">{displayContent}</p>
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
          )}

          {/* Image attachment */}
          {post.image_url && (
            <div className="mt-3 rounded-md overflow-hidden">
              <div className="relative w-full max-h-[500px]" style={{ aspectRatio: "16/9" }}>
                <Image
                  src={getStorageUrl(post.image_url) || '/placeholder.jpg'}
                  alt="Post attachment"
                  width={800}
                  height={450}
                  style={{ objectFit: "cover", width: "100%", height: "auto" }}
                  className="rounded-md"
                  loading="lazy"
                  quality={80}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.jpg';
                  }}
                />
              </div>
            </div>
          )}

          {/* Video attachment */}
          {post.video_url && (
            <div className="mt-3 rounded-md overflow-hidden">
              <video src={post.video_url} controls className="w-full" poster="/placeholder.jpg" />
            </div>
          )}

          {/* Document attachment */}
          {post.document_url && (
            <div className="mt-3">
              <a
                href={post.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-md border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <FileText className="h-5 w-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Document Attachment</p>
                  <p className="text-xs text-muted-foreground">Click to view or download</p>
                </div>
                <Button size="sm" variant="outline">
                  Open
                </Button>
              </a>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col px-6 py-3">
        {/* Like and comment counts */}
        <div className="flex justify-between w-full mb-3 text-sm text-muted-foreground">
          <div className="flex items-center">
            <ThumbsUp className="h-3 w-3 mr-1" />
            <span>{likes.length || 0}</span>
          </div>
          <div className="flex items-center">
            <MessageSquare className="h-3 w-3 mr-1" />
            <span>{comments.length || 0}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between w-full border-t pt-3">
          <Button
            variant="ghost"
            size="sm"
            className={`text-muted-foreground ${isLiked ? "text-primary" : ""}`}
            onClick={handleLikeToggle}
          >
            <ThumbsUp className={`h-4 w-4 mr-2 ${isLiked ? "fill-primary" : ""}`} />
            {isLiked ? "Liked" : "Like"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`text-muted-foreground ${showComments ? "bg-muted/50" : ""}`}
            onClick={handleToggleComments}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {comments.length > 0 ? `Comments (${comments.length})` : "Comments"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => {
                window.open(`https://twitter.com/intent/tweet?text=Check out this post from Safety Shaper&url=${window.location.origin}/posts/${post.id}`, '_blank')
              }} className="flex items-center gap-2 cursor-pointer">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Share on X
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}/posts/${post.id}`, '_blank')
              }} className="flex items-center gap-2 cursor-pointer">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 12-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>
                Share on Facebook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.origin}/posts/${post.id}`, '_blank')
              }} className="flex items-center gap-2 cursor-pointer">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                Share on LinkedIn
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={async () => {
                const url = `${window.location.origin}/posts/${post.id}`;
                await navigator.clipboard.writeText(url);
                toast({
                  title: "Link copied",
                  description: "Post link copied to clipboard"
                });
              }} className="flex items-center gap-2 cursor-pointer">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href={`/messages?share=${post.id}`} className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  Send as Message
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="w-full mt-4 space-y-4">
            {/* Comment form */}
            <form onSubmit={handleCommentSubmit} className="flex items-start gap-2 w-full">
              <div className="w-full">
                <div className="flex-1 relative">
                  <Textarea
                    placeholder="Write a comment..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    className="min-h-[60px] pr-10 resize-none w-full"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 bottom-2"
                    disabled={isSubmittingComment || !commentContent.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>

            {/* Comments list */}
            {isLoadingComments ? (
              <div className="text-center py-4">Loading comments...</div>
            ) : (
              <>
                {comments.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No comments yet</div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div
                        key={comment.id || `temp-comment-${Date.now()}-${Math.random()}`}
                        className="flex items-start gap-2"
                      >
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarImage
                            src={
                              comment.profiles?.avatar_url ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.profiles?.full_name || "User")}&size=40&background=random`
                            }
                            alt={comment.profiles?.full_name}
                          />
                          <AvatarFallback>
                            {getInitials(comment.profiles?.full_name || "User")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-muted rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <Link
                                href={`/profile/${comment.profiles?.username || "#"}`}
                                className="font-medium text-sm hover:underline"
                              >
                                {comment.profiles?.full_name || "Anonymous User"}
                              </Link>
                              {currentUser && comment.user_id === currentUser.id && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-600 focus:text-red-600"
                                      onClick={() => handleDeleteComment(comment.id)}
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                            <p className="text-sm mt-1">{comment.content}</p>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center">
                            <span>{formatDate(comment.created_at)}</span>
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
      </CardFooter>
    </Card>
  );
});

export default PostItem;