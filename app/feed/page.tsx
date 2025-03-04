"use client"

import { useState } from "react"
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

export default function FeedPage() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Sarah Johnson",
      role: "ESG Compliance Manager",
      company: "GreenTech Solutions",
      timeAgo: "2h",
      content: "Just completed our quarterly ESG report showing a 15% reduction in carbon emissions! #Sustainability #ESGGoals",
      likes: 24,
      comments: 5,
      shares: 2,
    },
    {
      id: 2,
      author: "Michael Chen",
      role: "Safety Director",
      company: "Industrial Innovations",
      timeAgo: "5h",
      content: "Excited to announce that we've reached 500 days without a workplace incident. Proud of our team's commitment to safety culture! #SafetyFirst #ZeroHarm",
      likes: 47,
      comments: 12,
      shares: 8,
    },
    {
      id: 3,
      author: "Elena Rodriguez",
      role: "Environmental Consultant",
      company: "EcoSolutions Partners",
      timeAgo: "1d",
      content: "Just published a new case study on implementing circular economy principles in manufacturing. Check it out and let me know your thoughts! https://example.com/circular-economy",
      likes: 36,
      comments: 7,
      shares: 15,
    },
  ])

  return (
    <div className="container max-w-4xl py-6">
      {/* Create Post Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <Input placeholder="Share your insights or updates..." className="bg-muted" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">
                <ImageIcon className="mr-2 h-4 w-4" />
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
            <Button>Post</Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-col">
                    <h3 className="font-semibold">{post.author}</h3>
                    <div className="flex items-center text-xs text-muted-foreground mb-1">
                      <span>{post.role}</span>
                      <span className="mx-1">•</span>
                      <Briefcase className="h-3 w-3 mr-1" />
                      <span>{post.company}</span>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{post.timeAgo}</span>
                    </span>
                  </div>
                  <div className="mt-2">
                    <p>{post.content}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t py-3 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Button variant="ghost" size="sm">
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  {post.likes}
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {post.comments}
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  {post.shares}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}