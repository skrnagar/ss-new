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
      location: "San Francisco, CA",
      time: "2 hours ago",
      content:
        "Just completed our quarterly ESG audit with flying colors! Our carbon reduction initiatives have exceeded targets by 15%. Proud of the team for their dedication to sustainability. #ESGCompliance #Sustainability",
      likes: 42,
      comments: 8,
      shares: 5,
      image: "/placeholder.svg?height=300&width=600",
    },
    {
      id: 2,
      author: "Michael Chen",
      role: "Health & Safety Director",
      company: "Industrial Innovations",
      location: "Chicago, IL",
      time: "5 hours ago",
      content:
        "Excited to share our new workplace safety protocol that reduced incidents by 30% in the first quarter. Looking for feedback from fellow safety professionals on implementation strategies. #WorkplaceSafety #EHS",
      likes: 28,
      comments: 15,
      shares: 7,
      image: null,
    },
    {
      id: 3,
      author: "Priya Patel",
      role: "Environmental Compliance Specialist",
      company: "EcoSystems Inc.",
      location: "Austin, TX",
      time: "1 day ago",
      content:
        "New EPA regulations on chemical storage are coming into effect next month. I've created a comprehensive checklist to help facilities prepare. Happy to share with anyone who needs it! #EPARegulations #Compliance",
      likes: 56,
      comments: 23,
      shares: 18,
      image: "/placeholder.svg?height=300&width=600",
    },
  ])

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Sidebar - Profile Summary */}
        <div className="hidden md:block">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Guest User</h3>
                <p className="text-muted-foreground text-sm mb-4">Welcome to Safety Shaper</p>
                <Button variant="secondary" className="w-full mb-4">
                  Complete Your Profile
                </Button>

                <div className="w-full border-t pt-4 mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Add your current position</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Add your location</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Joined July 2023</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Trending Topics</h3>
              <div className="space-y-3">
                <div>
                  <a href="#" className="text-primary hover:underline">
                    #ESGCompliance
                  </a>
                  <p className="text-xs text-muted-foreground">125 posts</p>
                </div>
                <div>
                  <a href="#" className="text-primary hover:underline">
                    #WorkplaceSafety
                  </a>
                  <p className="text-xs text-muted-foreground">98 posts</p>
                </div>
                <div>
                  <a href="#" className="text-primary hover:underline">
                    #SustainableDevelopment
                  </a>
                  <p className="text-xs text-muted-foreground">87 posts</p>
                </div>
                <div>
                  <a href="#" className="text-primary hover:underline">
                    #RenewableEnergy
                  </a>
                  <p className="text-xs text-muted-foreground">76 posts</p>
                </div>
                <div>
                  <a href="#" className="text-primary hover:underline">
                    #CarbonNeutral
                  </a>
                  <p className="text-xs text-muted-foreground">65 posts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Feed */}
        <div className="md:col-span-2">
          {/* Create Post */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-grow">
                  <Input placeholder="Share your thoughts, insights, or questions..." className="mb-4" />
                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <Image className="h-4 w-4 mr-2" />
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
                    <Button variant="secondary" size="sm">
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts */}
          {posts.map((post) => (
            <Card key={post.id} className="mb-6">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex flex-col">
                      <h3 className="font-semibold">{post.author}</h3>
                      <p className="text-sm text-muted-foreground">
                        {post.role} at {post.company}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{post.location}</span>
                        <span className="mx-2">•</span>
                        <span>{post.time}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="whitespace-pre-line">{post.content}</p>

                      {post.image && (
                        <div className="mt-4">
                          <img
                            src={post.image || "/placeholder.svg"}
                            alt="Post attachment"
                            className="rounded-lg w-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-6 py-3 border-t flex justify-between">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <ThumbsUp className="h-4 w-4 mr-2" />
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
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

