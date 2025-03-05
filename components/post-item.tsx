
"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ThumbsUp, MessageSquare, Share2, FileText, MoreHorizontal, Clock } from "lucide-react"
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
  const { toast } = useToast()
  const router = useRouter()
  
  const isAuthor = currentUser && post.user_id === currentUser.id
  const MAX_CONTENT_LENGTH = 300

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
      
      <CardFooter className="border-t px-6 py-3">
        <div className="flex justify-between w-full">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <ThumbsUp className="h-4 w-4 mr-2" />
            Like
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <MessageSquare className="h-4 w-4 mr-2" />
            Comment
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
