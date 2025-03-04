
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
      timePosted: "2h",
      content:
        "Just finished our quarterly sustainability report. Proud to announce we've reduced our carbon footprint by 15% this quarter! #Sustainability #ESG",
      likes: 42,
      comments: 12,
      shares: 5,
    },
    {
      id: 2,
      author: "Michael Chen",
      role: "Health & Safety Director",
      company: "Industrial Innovations",
      timePosted: "5h",
      content:
        "Excited to share that we've gone 365 days without a workplace incident! This achievement reflects our team's dedication to safety culture and continuous improvement. #SafetyFirst #ZeroHarm",
      likes: 78,
      comments: 23,
      shares: 15,
    },
    {
      id: 3,
      author: "Lisa Rodriguez",
      role: "Environmental Compliance Specialist",
      company: "EcoSolutions",
      timePosted: "1d",
      content:
        "New EPA regulations on chemical storage are coming next month. Is your facility prepared? I'm hosting a webinar next week to cover the key changes. Drop a comment if you're interested! #Compliance #EPA",
      likes: 34,
      comments: 28,
      shares: 19,
    },
  ])

  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar */}
        <div className="hidden lg:block space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-2 overflow-hidden">
                  <img
                    src="/placeholder-user.jpg"
                    alt="User"
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="font-semibold">Sarah Johnson</h3>
                <p className="text-sm text-muted-foreground">ESG Compliance Manager</p>
                <div className="w-full pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Profile views</span>
                    <span className="font-semibold">143</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Post impressions</span>
                    <span className="font-semibold">1,205</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Recent Groups</h3>
              <ul className="space-y-3">
                <li className="text-sm">
                  <a href="#" className="hover:underline">
                    Sustainability Professionals
                  </a>
                </li>
                <li className="text-sm">
                  <a href="#" className="hover:underline">
                    EHS Leaders Network
                  </a>
                </li>
                <li className="text-sm">
                  <a href="#" className="hover:underline">
                    ESG Reporting Standards
                  </a>
                </li>
                <li className="text-sm">
                  <a href="#" className="hover:underline">
                    Workplace Safety Innovations
                  </a>
                </li>
              </ul>
              <Button variant="ghost" className="w-full mt-3 text-primary text-sm">
                See all groups
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create Post */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  <img
                    src="/placeholder-user.jpg"
                    alt="User"
                    className="h-full w-full object-cover"
                  />
                </div>
                <Input placeholder="Share an update or insight..." className="bg-muted" />
              </div>
              <div className="flex justify-between mt-4">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Image className="h-4 w-4 mr-2" />
                  Image
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <FileText className="h-4 w-4 mr-2" />
                  Document
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Event
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Posts */}
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img
                      src="/placeholder-user.jpg"
                      alt={post.author}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">{post.author}</h4>
                    <p className="text-xs text-muted-foreground">{post.role}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Briefcase className="h-3 w-3 mr-1" />
                      <span>{post.company}</span>
                      <span className="mx-1">•</span>
                      <span>{post.timePosted}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm mb-4">{post.content}</p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{post.likes} likes</span>
                  <span>{post.comments} comments • {post.shares} shares</span>
                </div>
              </CardContent>
              <CardFooter className="border-t px-4 py-2 flex justify-between">
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
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
