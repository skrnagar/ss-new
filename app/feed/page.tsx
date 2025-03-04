"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  Image,
  FileText,
  Video,
  User,
  MapPin,
  Briefcase,
  Calendar,
} from "lucide-react"

export default function FeedPage() {
  const router = useRouter()
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Sarah Johnson",
      role: "ESG Compliance Manager",
      company: "GreenTech Solutions",
      location: "San Francisco, CA",
      time: "2 hours ago",
      content:
        "Just completed our quarterly sustainability report. Proud to announce we've reduced our carbon footprint by 15% this quarter! #Sustainability #ESG",
      likes: 24,
      comments: 5,
      shares: 2,
    },
    {
      id: 2,
      author: "David Chen",
      role: "Health & Safety Director",
      company: "Construction Corp",
      location: "Chicago, IL",
      time: "1 day ago",
      content:
        "Excited to share our new safety protocol that has reduced workplace incidents by 30% this year. Implementing a proactive safety culture really makes a difference! #WorkplaceSafety #EHS",
      likes: 42,
      comments: 8,
      shares: 12,
    },
  ])
  const [newPost, setNewPost] = useState("")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push('/auth/login')
      } else {
        setUser(data.session.user)
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  const handlePost = () => {
    if (!newPost.trim()) return

    const post = {
      id: posts.length + 1,
      author: user?.user_metadata?.name || "Current User",
      role: user?.user_metadata?.role || "Professional",
      company: user?.user_metadata?.company || "",
      location: user?.user_metadata?.location || "",
      time: "Just now",
      content: newPost,
      likes: 0,
      comments: 0,
      shares: 0,
    }

    setPosts([post, ...posts])
    setNewPost("")
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <p>Loading feed...</p>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Create Post */}
      <Card className="border border-border">
        <CardContent className="pt-6">
          <div className="flex space-x-4">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Share an update or insight..."
                className="bg-muted"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t flex justify-between pt-4">
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="flex items-center">
              <Image className="mr-2 h-4 w-4" />
              Photo
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center">
              <Video className="mr-2 h-4 w-4" />
              Video
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Document
            </Button>
          </div>
          <Button onClick={handlePost} disabled={!newPost.trim()}>
            Post
          </Button>
        </CardFooter>
      </Card>

      {/* Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="border border-border">
            <CardContent className="pt-6">
              <div className="flex space-x-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-semibold">{post.author}</div>
                  <div className="text-sm text-muted-foreground">{post.role}</div>
                  <div className="flex items-center text-xs text-muted-foreground space-x-2 mt-1">
                    {post.company && (
                      <div className="flex items-center">
                        <Briefcase className="mr-1 h-3 w-3" />
                        {post.company}
                      </div>
                    )}
                    {post.location && (
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        {post.location}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {post.time}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">{post.content}</div>
            </CardContent>
            <CardFooter className="border-t flex justify-between pt-4">
              <Button variant="ghost" size="sm" className="flex items-center">
                <ThumbsUp className="mr-2 h-4 w-4" />
                {post.likes > 0 && <span>{post.likes}</span>}
                <span className="ml-1">Like</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                {post.comments > 0 && <span>{post.comments}</span>}
                <span className="ml-1">Comment</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center">
                <Share2 className="mr-2 h-4 w-4" />
                {post.shares > 0 && <span>{post.shares}</span>}
                <span className="ml-1">Share</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}