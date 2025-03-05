
"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ThumbsUp, MessageSquare, Share2, User, FileText, Play } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface PostItemProps {
  post: {
    id: string
    content: string
    created_at: string
    image_url: string | null
    video_url: string | null
    document_url: string | null
    user: {
      id: string
      username: string
      full_name: string | null
      avatar_url: string | null
      position: string | null
      company: string | null
    }
  }
  currentUserId?: string
}

export function PostItem({ post, currentUserId }: PostItemProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const { toast } = useToast()
  
  const toggleLike = () => {
    if (!currentUserId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like posts",
        variant: "destructive",
      })
      return
    }
    
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
    
    // Here you would add code to update likes in the database
  }
  
  const handleComment = () => {
    // Comment functionality would be implemented here
    toast({
      title: "Comments",
      description: "Comment functionality is coming soon",
    })
  }
  
  const handleShare = () => {
    // Share functionality would be implemented here
    navigator.clipboard.writeText(window.location.origin + `/post/${post.id}`)
    toast({
      title: "Link copied",
      description: "Post link copied to clipboard",
    })
  }
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return dateString
    }
  }

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3 mb-4">
          <Link href={`/profile/${post.user.username}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.user.avatar_url || ""} alt={post.user.full_name || post.user.username} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
          </Link>
          
          <div>
            <Link href={`/profile/${post.user.username}`} className="font-medium hover:underline">
              {post.user.full_name || post.user.username}
            </Link>
            {post.user.position && post.user.company && (
              <p className="text-sm text-muted-foreground">
                {post.user.position} at {post.user.company}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {formatDate(post.created_at)}
            </p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="whitespace-pre-wrap break-words">{post.content}</p>
        </div>
        
        {/* Image attachment */}
        {post.image_url && (
          <div className="mt-4 rounded-md overflow-hidden bg-muted/20">
            <img 
              src={post.image_url} 
              alt="Post image" 
              className="w-full h-auto object-contain max-h-[400px]"
              loading="lazy" 
            />
          </div>
        )}
        
        {/* Video attachment */}
        {post.video_url && (
          <div className="mt-4 rounded-md overflow-hidden bg-black">
            <video 
              src={post.video_url} 
              controls 
              className="w-full h-auto max-h-[400px]"
              poster="/placeholder.svg?height=400&width=600"
            >
              Your browser does not support video playback.
            </video>
          </div>
        )}
        
        {/* Document attachment */}
        {post.document_url && (
          <div className="mt-4">
            <a 
              href={post.document_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center p-3 border rounded-md hover:bg-muted/20 transition-colors"
            >
              <FileText className="h-8 w-8 mr-3 text-primary" />
              <div>
                <p className="font-medium">Document</p>
                <p className="text-sm text-muted-foreground">Click to view or download</p>
              </div>
            </a>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-4 pb-3">
        <div className="flex justify-between w-full">
          <Button 
            variant={isLiked ? "default" : "ghost"} 
            size="sm" 
            className={isLiked ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}
            onClick={toggleLike}
          >
            <ThumbsUp className={`h-4 w-4 mr-2 ${isLiked ? "fill-primary" : ""}`} />
            {likeCount > 0 ? `${likeCount} Like${likeCount !== 1 ? 's' : ''}` : 'Like'}
          </Button>
          
          <Button variant="ghost" size="sm" onClick={handleComment}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Comment
          </Button>
          
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
