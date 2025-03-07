
"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageSquare, ThumbsUp, Share2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface UserActivityProps {
  userId: string
  isOwnProfile: boolean
}

export function UserActivity({ userId, isOwnProfile }: UserActivityProps) {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchActivities() {
      try {
        setLoading(true)
        
        // Fetch user's posts
        const { data: posts, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5)
        
        if (postsError) throw postsError

        // Fetch user's comments
        const { data: comments, error: commentsError } = await supabase
          .from('comments')
          .select('*, posts(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5)
          
        if (commentsError) throw commentsError

        // Fetch user's likes
        const { data: likes, error: likesError } = await supabase
          .from('likes')
          .select('*, posts(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5)
          
        if (likesError) throw likesError

        // Combine and sort activities
        const allActivities = [
          ...posts.map((post) => ({
            type: 'post',
            created_at: post.created_at,
            data: post
          })),
          ...comments.map((comment) => ({
            type: 'comment',
            created_at: comment.created_at,
            data: comment
          })),
          ...likes.map((like) => ({
            type: 'like',
            created_at: like.created_at,
            data: like
          }))
        ].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 5)
        
        setActivities(allActivities)
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [userId])

  // Format the activity date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="border-b pb-3 last:border-b-0 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  {activity.type === 'post' && (
                    <MessageSquare className="h-4 w-4 text-primary" />
                  )}
                  {activity.type === 'comment' && (
                    <MessageSquare className="h-4 w-4 text-green-500" />
                  )}
                  {activity.type === 'like' && (
                    <ThumbsUp className="h-4 w-4 text-blue-500" />
                  )}
                  <span className="text-sm font-medium">
                    {activity.type === 'post' && 'Created a post'}
                    {activity.type === 'comment' && 'Commented on a post'}
                    {activity.type === 'like' && 'Liked a post'}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(activity.created_at)}
                  </span>
                </div>
                
                <p className="text-sm line-clamp-2">
                  {activity.type === 'post' && activity.data.content}
                  {activity.type === 'comment' && activity.data.content}
                  {activity.type === 'like' && activity.data.posts?.content}
                </p>
                
                {activity.type !== 'post' && (
                  <Link 
                    href={`/post/${activity.data.post_id}`} 
                    className="text-xs text-primary hover:underline mt-1 inline-block"
                  >
                    View post
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No recent activity to display</p>
            {isOwnProfile && (
              <Button variant="link" asChild>
                <Link href="/feed">Share your first post</Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
