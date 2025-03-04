
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
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
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Sarah Johnson",
      role: "ESG Compliance Manager",
      company: "GreenTech Solutions",
      location: "San Francisco, CA",
      time: "2h ago",
      content:
        "Just published our latest sustainability report. Proud to share that we've reduced our carbon footprint by 30% this year! #ESG #Sustainability",
      likes: 42,
      comments: 8,
      shares: 12,
    },
    {
      id: 2,
      author: "Michael Chen",
      role: "Health & Safety Director",
      company: "BuildRight Construction",
      location: "Chicago, IL",
      time: "5h ago",
      content:
        "Excited to announce that we've reached 500 days without a safety incident across all our project sites! This is a testament to our robust safety culture and protocols. #SafetyFirst #EHS",
      likes: 78,
      comments: 15,
      shares: 23,
    },
    {
      id: 3,
      author: "Emily Rodriguez",
      role: "Environmental Specialist",
      company: "EcoSystems Inc.",
      location: "Austin, TX",
      time: "1d ago",
      content:
        "Looking for recommendations on the best environmental compliance tracking software for a mid-sized manufacturing company. What's everyone using these days?",
      likes: 12,
      comments: 32,
      shares: 3,
    },
  ])
  const [newPost, setNewPost] = useState("")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          // If no session, redirect to login
          router.replace('/auth/login?redirectUrl=/feed')
          return
        }
        
        setUser(session.user)
        setLoading(false)
      } catch (error) {
        console.error('Error checking auth status:', error)
        setLoading(false)
      }
    }
    
    checkUser()
  }, [router])

  const handleNewPost = () => {
    if (!newPost.trim()) return
    
    const userPost = {
      id: Math.floor(Math.random() * 10000),
      author: user?.user_metadata?.name || user?.email?.split('@')[0] || "User",
      role: "ESG Professional",
      company: "Company Name",
      location: "Location",
      time: "Just now",
      content: newPost,
      likes: 0,
      comments: 0,
      shares: 0,
    }

    setPosts([userPost, ...posts])
    setNewPost("")
    
    toast({
      title: "Post created",
      description: "Your post has been published to the feed",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardContent className="pt-6">
          <Input
            placeholder="Share an update or insight..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="mb-4"
          />
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm">
                <Image className="mr-2 h-4 w-4" />
                Photo
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="mr-2 h-4 w-4" />
                Video
              </Button>
              <Button variant="ghost" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Document
              </Button>
            </div>
            <Button onClick={handleNewPost} disabled={!newPost.trim()}>
              Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {posts.map((post) => (
        <Card key={post.id} className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4 mb-4">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <div className="font-medium">{post.author}</div>
                <div className="text-sm text-muted-foreground">{post.role} at {post.company}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="mr-1 h-3 w-3" />
                  {post.location} · <Calendar className="mx-1 h-3 w-3" /> {post.time}
                </div>
              </div>
            </div>
            <p className="mb-4">{post.content}</p>
          </CardContent>
          <CardFooter className="border-t px-6 py-3">
            <div className="flex justify-between w-full">
              <Button variant="ghost" size="sm">
                <ThumbsUp className="mr-2 h-4 w-4" />
                {post.likes > 0 && post.likes}
              </Button>
              <Button variant="ghost" size="sm">
                <MessageSquare className="mr-2 h-4 w-4" />
                {post.comments > 0 && post.comments}
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                {post.shares > 0 && post.shares}
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
