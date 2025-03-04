
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  Image as ImageIcon,
  FileText,
  Video,
  User,
  MapPin,
  Briefcase,
  Calendar,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function FeedPage() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Sarah Johnson",
      role: "ESG Compliance Manager",
      company: "GreenTech Solutions",
      location: "San Francisco, CA",
      time: "2 hours ago",
      content:
        "Just published our quarterly ESG report showing a 15% reduction in carbon emissions compared to last year. Proud of the team's hard work implementing our sustainability initiatives! #ESG #Sustainability #CarbonReduction",
      likes: 42,
      comments: 12,
      shares: 8,
      liked: false,
    },
    {
      id: 2,
      author: "Michael Chen",
      role: "Safety Director",
      company: "Construct Safe Inc.",
      location: "Chicago, IL",
      time: "4 hours ago",
      content:
        "Excited to share that our company has reached 365 days without a lost-time incident! This milestone is a testament to our team's dedication to safety culture and continuous improvement. #SafetyFirst #ZeroHarm #OccupationalSafety",
      likes: 87,
      comments: 23,
      shares: 15,
      liked: true,
    },
    {
      id: 3,
      author: "Jessica Rodriguez",
      role: "Environmental Specialist",
      company: "EcoConsult Partners",
      location: "Austin, TX",
      time: "Yesterday",
      content:
        "Just finished a comprehensive environmental impact assessment for a new renewable energy project. The potential to offset 50,000 tons of CO2 annually is impressive! Looking forward to seeing this project move forward. #RenewableEnergy #EnvironmentalImpact #Sustainability",
      likes: 65,
      comments: 18,
      shares: 12,
      liked: false,
    },
  ])
  
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const router = useRouter()
  
  useEffect(() => {
    // Check if user is authenticated
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          // Redirect to login if not authenticated
          router.replace('/auth/login')
          return
        }
        
        setUser(session.user)
      } catch (error) {
        console.error('Error checking auth status:', error)
        router.replace('/auth/login')
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [router])

  const handleLike = (id) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id
          ? {
              ...post,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
              liked: !post.liked,
            }
          : post
      )
    )
  }

  if (loading) {
    return <div className="container py-8 text-center">Loading...</div>
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Post creation card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <User className="h-10 w-10 rounded-full bg-muted p-2" />
                <div className="flex-1">
                  <Input className="bg-muted" placeholder="Share an update or post..." />
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Photo
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Video className="h-4 w-4 mr-2" />
                    Video
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <FileText className="h-4 w-4 mr-2" />
                    Document
                  </Button>
                </div>
                <Button size="sm">Post</Button>
              </div>
            </CardContent>
          </Card>

          {/* Feed posts */}
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <User className="h-10 w-10 rounded-full bg-primary/10 p-2 text-primary" />
                  <div>
                    <div className="font-medium">{post.author}</div>
                    <div className="text-sm text-muted-foreground">{post.role}</div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {post.company}
                      <span className="mx-1">•</span>
                      <MapPin className="h-3 w-3 mr-1" />
                      {post.location}
                      <span className="mx-1">•</span>
                      <Calendar className="h-3 w-3 mr-1" />
                      {post.time}
                    </div>
                  </div>
                </div>
                <div className="mt-4">{post.content}</div>
              </CardContent>
              <CardFooter className="border-t px-6 py-3">
                <div className="flex justify-between w-full">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={post.liked ? "text-primary" : "text-muted-foreground"}
                    onClick={() => handleLike(post.id)}
                  >
                    <ThumbsUp className={`h-4 w-4 mr-2 ${post.liked ? "fill-primary" : ""}`} />
                    {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {post.comments}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Share2 className="h-4 w-4 mr-2" />
                    {post.shares}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6 hidden md:block">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Trending in ESG & EHS</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-sm hover:underline">#SustainabilityGoals</a>
                </li>
                <li>
                  <a href="#" className="text-sm hover:underline">#SafetyLeadership</a>
                </li>
                <li>
                  <a href="#" className="text-sm hover:underline">#ClimateAction</a>
                </li>
                <li>
                  <a href="#" className="text-sm hover:underline">#ESGReporting</a>
                </li>
                <li>
                  <a href="#" className="text-sm hover:underline">#GreenTech</a>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">People You May Know</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-8 w-8 rounded-full bg-muted p-1" />
                    <div>
                      <div className="text-sm font-medium">David Kim</div>
                      <div className="text-xs text-muted-foreground">Sustainability Manager at EcoTech</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-8 w-8 rounded-full bg-muted p-1" />
                    <div>
                      <div className="text-sm font-medium">Lisa Patel</div>
                      <div className="text-xs text-muted-foreground">Health & Safety Lead at SafeWork Inc.</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-8 w-8 rounded-full bg-muted p-1" />
                    <div>
                      <div className="text-sm font-medium">Mark Johnson</div>
                      <div className="text-xs text-muted-foreground">Environmental Compliance Officer at GreenCorp</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium">ESG Reporting Workshop</div>
                  <div className="text-xs text-muted-foreground">June 15, 2023 • Virtual</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Safety Leadership Conference</div>
                  <div className="text-xs text-muted-foreground">July 10-12, 2023 • Chicago, IL</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Sustainability Innovation Summit</div>
                  <div className="text-xs text-muted-foreground">August 5, 2023 • San Francisco, CA</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
