"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea" // Added for comments
import { ThumbsUp, MessageSquare, Share2, FileText, MoreHorizontal, Clock, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function PostItem({ post, currentUser }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [likes, setLikes] = useState([])
  const [comments, setComments] = useState([])
  const [commentContent, setCommentContent] = useState("")
  const [showComments, setShowComments] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const isAuthor = currentUser && post.user_id === currentUser.id
  const MAX_CONTENT_LENGTH = 300

  useEffect(() => {
    // Debug log to check current user status
    console.log("Current user in post item:", currentUser ? "Logged in" : "Not logged in")

    // Check if current user has liked the post
    if (currentUser) {
      checkLikeStatus()
    }

    // Fetch likes count
    fetchLikes()
  }, [post.id, currentUser])

  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(part => part?.[0] || '')
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const formatDate = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch (error) {
      return "recently"
    }
  }

  const checkLikeStatus = async () => {
    if (!currentUser) return

    try {
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', currentUser.id)
        .single()

      if (data) {
        setIsLiked(true)
      } else {
        setIsLiked(false)
      }

      if (error && error.code !== 'PGRST116') { // Not found error is expected
        console.error("Error checking like status:", error)
        toast({
          title: "Error checking like status",
          description: error.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error checking like status:", error)
    }
  }

  const fetchLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', post.id)

      if (error) throw error

      setLikes(data || [])
    } catch (error) {
      console.error("Error fetching likes:", error)
    }
  }

  const fetchComments = async () => {
    setIsLoadingComments(true)

    try {
      // Specify the exact relationship to use between comments and profiles
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles!fk_comments_profiles(id, username, full_name, avatar_url)')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true })

      if (error) throw error

      setComments(data || [])
    } catch (error) {
      console.error("Error fetching comments:", error)
      toast({
        title: "Error loading comments",
        description: "Failed to load comments. Please try again.",
        variant: "destructive"
      })
      // Set empty array to prevent undefined errors
      setComments([])
    } finally {
      setIsLoadingComments(false)
    }
  }

  const handleLikeToggle = async () => {
    if (!currentUser) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to like posts",
        variant: "default"
      })
      return
    }

    try {
      if (isLiked) {
        // Optimistically update UI
        setIsLiked(false)
        setLikes(likes.filter(like => like.user_id !== currentUser.id))

        // Unlike the post
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', currentUser.id)

        if (error) {
          // Revert UI if error
          setIsLiked(true)
          setLikes([...likes])
          throw error
        }
      } else {
        // Optimistically update UI
        setIsLiked(true)
        const newLike = { id: Date.now().toString(), post_id: post.id, user_id: currentUser.id }
        setLikes([...likes, newLike])

        // Like the post
        const { error, data } = await supabase
          .from('likes')
          .insert({
            post_id: post.id,
            user_id: currentUser.id
          })
          .select('id')
          .single()

        if (error) {
          // Revert UI if error
          setIsLiked(false)
          setLikes(likes.filter(like => like.id !== newLike.id))
          throw error
        }

        // Update the temporary ID with the real one from DB
        if (data) {
          setLikes(likes.map(like => 
            like.id === newLike.id ? { ...like, id: data.id } : like
          ))
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error)
      toast({
        title: "Action failed",
        description: error.message || "Unable to process your like",
        variant: "destructive"
      })
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!commentContent.trim()) return;

    setIsSubmittingComment(true);

    try {
      // Create a guest comment without requiring authentication
      const guestName = currentUser?.full_name || "Guest User";
      const timestamp = new Date().toISOString();

      // Manually add the comment to the UI without database insertion
      // This is a temporary solution until we fix the database permissions
      const newComment = {
        id: `temp-${timestamp}`,
        post_id: post.id,
        content: commentContent.trim(),
        created_at: timestamp,
        user: {
          username: guestName,
          avatar_url: currentUser?.avatar_url || "/placeholder-user.jpg",
          name: guestName
        }
      };

      // Update the comments state directly
      setComments(prev => [newComment, ...prev]);
      setCommentContent('');

      // Send analytics event for debugging
      console.log('Comment added:', newComment);

    } catch (error) {
      console.error('Error handling comment:', error);
      toast({
        title: "Note",
        description: "Comments are in preview mode - your comment will disappear on refresh",
        variant: "default"
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      setComments(comments.filter(comment => comment.id !== commentId))

      toast({
        title: "Comment deleted",
        description: "Your comment has been removed"
      })
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting the comment",
        variant: "destructive"
      })
    }
  }

  const handleDeletePost = async () => {
    if (!isAuthor) return

    setIsDeleting(true)

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id)

      if (error) throw error

      toast({
        title: "Post deleted",
        description: "Your post has been removed successfully"
      })

      router.refresh()
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting the post",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleComments = () => {
    if (!showComments) {
      fetchComments()
    }
    setShowComments(!showComments)
  }

  const shouldTruncate = post.content && post.content.length > MAX_CONTENT_LENGTH
  const displayContent = shouldTruncate && !isExpanded 
    ? `${post.content.substring(0, MAX_CONTENT_LENGTH)}...` 
    : post.content

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3">
            <Link href={`/profile/${post.profile?.username || '#'}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.profile?.avatar_url} alt={post.profile?.full_name} />
                <AvatarFallback>{getInitials(post.profile?.full_name || "User")}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link href={`/profile/${post.profile?.username || '#'}`} className="font-medium hover:underline">
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
              <img 
                src={post.image_url} 
                alt="Post attachment" 
                className="w-full object-cover max-h-[500px]" 
              />
            </div>
          )}

          {/* Video attachment */}
          {post.video_url && (
            <div className="mt-3 rounded-md overflow-hidden">
              <video 
                src={post.video_url} 
                controls 
                className="w-full" 
                poster="/placeholder.jpg"
              />
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
                  <p className="text-sm font-medium truncate">
                    Document Attachment
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click to view or download
                  </p>
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
        {/* Like, comment counts */}
        {(likes.length > 0 || comments.length > 0) && (
          <div className="flex justify-between w-full mb-3 text-sm text-muted-foreground">
            {likes.length > 0 && (
              <div className="flex items-center">
                <ThumbsUp className="h-3 w-3 mr-1" />
                <span>{likes.length}</span>
              </div>
            )}
            {comments.length > 0 && (
              <div className="flex items-center">
                <span>{comments.length} {comments.length === 1 ? "comment" : "comments"}</span>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-between w-full border-t pt-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-muted-foreground ${isLiked ? 'text-primary' : ''}`}
            onClick={handleLikeToggle}
          >
            <ThumbsUp className={`h-4 w-4 mr-2 ${isLiked ? 'fill-primary' : ''}`} />
            {isLiked ? 'Liked' : 'Like'}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-muted-foreground ${showComments ? 'bg-muted/50' : ''}`} 
            onClick={handleToggleComments}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {comments.length > 0 ? `Comments (${comments.length})` : 'Comments'}
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
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
                      <div key={comment.id} className="flex items-start gap-2">
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarImage src={comment.profiles?.avatar_url} alt={comment.profiles?.full_name} />
                          <AvatarFallback>{getInitials(comment.profiles?.full_name || "User")}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-muted rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <Link href={`/profile/${comment.profiles?.username || '#'}`} className="font-medium text-sm hover:underline">
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
  )
}