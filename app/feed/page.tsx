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
      time: "2 hours ago",
      content:
        "Just published our latest sustainability report showing a 15% reduction in carbon emissions across our operations. Proud of what our team has accomplished! #Sustainability #ESG",
      likes: 24,
      comments: 5,
      shares: 2,
    },
    {
      id: 2,
      author: "Michael Chen",
      role: "Workplace Safety Director",
      company: "BuildSafe Construction",
      time: "Yesterday",
      content:
        "Excited to announce that we've achieved 365 days without a workplace incident. Our new safety protocols and training programs are really making a difference. #SafetyFirst #WorkplaceWellness",
      likes: 87,
      comments: 12,
      shares: 15,
    },
    {
      id: 3,
      author: "Priya Sharma",
      role: "Environmental Compliance Specialist",
      company: "EcoConsult Group",
      time: "2 days ago",
      content:
        "Attending the International ESG Summit next week in London. Looking forward to connecting with fellow professionals and learning about the latest regulatory developments. Who else will be there? #ESGSummit #Networking",
      likes: 32,
      comments: 8,
      shares: 3,
    },
  ])

  return (
    <div className="container py-6 max-w-4xl">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0">
              <img
                src="/placeholder-user.jpg"
                alt="User"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <Input placeholder="Share an update or insight..." className="flex-grow" />
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="ghost" size="sm">
              <ImageIcon className="mr-2 h-4 w-4" />
              Image
            </Button>
            <Button variant="ghost" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Document
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="mr-2 h-4 w-4" />
              Video
            </Button>
            <Button variant="default" size="sm">
              Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {posts.map((post) => (
        <Card key={post.id} className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0">
                <img
                  src="/placeholder-user.jpg"
                  alt={post.author}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div>
                <div className="flex flex-col">
                  <span className="font-semibold">{post.author}</span>
                  <span className="text-sm text-muted-foreground">{post.role}</span>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Briefcase className="mr-1 h-3 w-3" />
                    <span>{post.company}</span>
                    <span className="mx-1">•</span>
                    <Calendar className="mr-1 h-3 w-3" />
                    <span>{post.time}</span>
                  </div>
                </div>
                <div className="mt-3">{post.content}</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t py-3 flex justify-between">
            <Button variant="ghost" size="sm">
              <ThumbsUp className="mr-1 h-4 w-4" />
              {post.likes}
            </Button>
            <Button variant="ghost" size="sm">
              <MessageSquare className="mr-1 h-4 w-4" />
              {post.comments}
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="mr-1 h-4 w-4" />
              {post.shares}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}