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

"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileText, Image, Video, Users, MessageSquare, ThumbsUp, Share2, BarChart, Search, Bell, Clock, Briefcase, Filter } from "lucide-react"
import Link from "next/link"

export default function FeedPage() {
  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="p-6 pb-0">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" alt="John Doe" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">John Doe</div>
                    <div className="text-sm text-muted-foreground">EHS Specialist</div>
                  </div>
                </div>
              </div>
              <div className="border-t mt-6">
                <div className="flex justify-between p-4">
                  <div className="text-sm">Profile Views</div>
                  <div className="font-medium">278</div>
                </div>
                <div className="flex justify-between p-4 pt-0">
                  <div className="text-sm">Post Impressions</div>
                  <div className="font-medium">1,247</div>
                </div>
              </div>
              <div className="border-t p-4">
                <Link href="/profile" className="text-primary text-sm">
                  View my profile
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Trending Topics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <div className="text-sm font-medium">#ESGCompliance</div>
                <div className="text-xs text-muted-foreground">1,243 posts</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">#ISO45001</div>
                <div className="text-xs text-muted-foreground">876 posts</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">#SustainabilityReporting</div>
                <div className="text-xs text-muted-foreground">642 posts</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">#SafetyLeadership</div>
                <div className="text-xs text-muted-foreground">519 posts</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">#RenewableEnergy</div>
                <div className="text-xs text-muted-foreground">417 posts</div>
              </div>
              <Button variant="link" className="text-sm p-0">
                View all
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">My Groups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-md">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">Renewable Energy Compliance</div>
                  <div className="text-xs text-muted-foreground">3,241 members</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-md">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">ISO 45001 Implementers</div>
                  <div className="text-xs text-muted-foreground">1,872 members</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-md">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">ESG Professionals Network</div>
                  <div className="text-xs text-muted-foreground">5,129 members</div>
                </div>
              </div>
              <Button variant="link" className="text-sm p-0">
                <Link href="/groups">View all groups</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex space-x-4">
                <Avatar>
                  <AvatarImage src="/placeholder-user.jpg" alt="John Doe" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input placeholder="Share something with your network..." className="rounded-full" />
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <Button variant="ghost" size="sm" className="rounded-full">
                  <Image className="h-4 w-4 mr-2" />
                  Photo
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full">
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Document
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full">
                  <BarChart className="h-4 w-4 mr-2" />
                  Poll
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="all">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="connections">Connections</TabsTrigger>
                <TabsTrigger value="groups">Groups</TabsTrigger>
              </TabsList>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </div>
            
            <TabsContent value="all" className="space-y-6 mt-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    <Avatar>
                      <AvatarImage src="/placeholder.jpg" alt="Sarah Johnson" />
                      <AvatarFallback>SJ</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Sarah Johnson</span>
                          <span className="text-sm text-muted-foreground"> • ESG Director at Sustainable Corp</span>
                        </div>
                        <div className="text-xs text-muted-foreground">3h</div>
                      </div>
                      <p className="my-3">
                        Excited to share that our company has achieved carbon neutrality across all operations! 🌿 This has been a tremendous team effort involving stakeholders across the organization. #Sustainability #NetZero #ClimateAction
                      </p>
                      <div className="bg-muted rounded-md overflow-hidden mt-3 mb-4">
                        <img src="/placeholder.jpg" alt="Carbon neutral certification" className="w-full h-auto" />
                      </div>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <div>124 likes • 36 comments</div>
                      </div>
                      <div className="border-t border-b my-4 flex justify-between py-2">
                        <Button variant="ghost" size="sm">
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Like
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Comment
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                      <div className="flex space-x-4 mt-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder-user.jpg" alt="John Doe" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Input placeholder="Add a comment..." className="rounded-full h-8" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    <Avatar>
                      <AvatarImage src="/placeholder.jpg" alt="Michael Chen" />
                      <AvatarFallback>MC</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Michael Chen</span>
                          <span className="text-sm text-muted-foreground"> • Safety Manager at Industrial Solutions</span>
                        </div>
                        <div className="text-xs text-muted-foreground">5h</div>
                      </div>
                      <p className="my-3">
                        Just published a new article on the impact of ISO 45001 implementation on workplace incident rates. Our study shows a 47% reduction in reportable incidents after full implementation. Check it out!
                      </p>
                      <div className="p-4 border rounded-md mt-3 mb-4 flex">
                        <FileText className="h-10 w-10 text-primary mr-4" />
                        <div>
                          <div className="font-medium">The Impact of ISO 45001 on Workplace Safety</div>
                          <div className="text-sm text-muted-foreground">safetyjournal.com</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <div>89 likes • 17 comments</div>
                      </div>
                      <div className="border-t border-b my-4 flex justify-between py-2">
                        <Button variant="ghost" size="sm">
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Like
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Comment
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    <Avatar>
                      <AvatarImage src="/placeholder.jpg" alt="Emily Rodriguez" />
                      <AvatarFallback>ER</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Emily Rodriguez</span>
                          <span className="text-sm text-muted-foreground"> posted in </span>
                          <span className="font-medium">Renewable Energy Compliance</span>
                        </div>
                        <div className="text-xs text-muted-foreground">8h</div>
                      </div>
                      <p className="my-3">
                        Has anyone implemented the new solar panel recycling requirements in California? Looking for best practices on documentation and compliance verification.
                      </p>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <div>42 likes • 26 comments</div>
                      </div>
                      <div className="border-t border-b my-4 flex justify-between py-2">
                        <Button variant="ghost" size="sm">
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Like
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Comment
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="connections" className="space-y-6 mt-6">
              {/* Connection-specific content would go here */}
              <div className="p-12 text-center text-muted-foreground">
                Select this tab to see posts from your connections
              </div>
            </TabsContent>
            
            <TabsContent value="groups" className="space-y-6 mt-6">
              {/* Group-specific content would go here */}
              <div className="p-12 text-center text-muted-foreground">
                Select this tab to see posts from your groups
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Network Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src="/placeholder.jpg" alt="Robert Taylor" />
                    <AvatarFallback>RT</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">Robert Taylor</div>
                    <div className="text-xs text-muted-foreground">Safety Director, EcoTech</div>
                  </div>
                </div>
                <Button size="sm">Connect</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src="/placeholder.jpg" alt="Lisa Wong" />
                    <AvatarFallback>LW</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">Lisa Wong</div>
                    <div className="text-xs text-muted-foreground">ESG Consultant, Sustainability Partners</div>
                  </div>
                </div>
                <Button size="sm">Connect</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src="/placeholder.jpg" alt="James Wilson" />
                    <AvatarFallback>JW</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">James Wilson</div>
                    <div className="text-xs text-muted-foreground">EHS Manager, BuildRight Construction</div>
                  </div>
                </div>
                <Button size="sm">Connect</Button>
              </div>
              
              <div className="pt-2">
                <Button variant="link" className="text-sm p-0">
                  View all suggestions
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-md p-3">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-sm font-medium">ISO 45001 Implementation Workshop</div>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  July 15, 2023 • Virtual • Free
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  Register
                </Button>
              </div>
              
              <div className="border rounded-md p-3">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-sm font-medium">ESG Reporting Standards Panel</div>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  August 3, 2023 • San Francisco, CA • $199
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  Register
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Featured Jobs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">EHS Manager</div>
                  <Badge>New</Badge>
                </div>
                <div className="flex items-center text-xs text-muted-foreground mb-2">
                  <Briefcase className="h-3 w-3 mr-1" />
                  Tesla, Inc.
                </div>
                <div className="flex items-center text-xs text-muted-foreground mb-3">
                  <MapPin className="h-3 w-3 mr-1" />
                  Austin, TX
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  <Link href="/jobs">View Job</Link>
                </Button>
              </div>
              
              <div className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">ESG Consultant</div>
                  <Badge>New</Badge>
                </div>
                <div className="flex items-center text-xs text-muted-foreground mb-2">
                  <Briefcase className="h-3 w-3 mr-1" />
                  Deloitte
                </div>
                <div className="flex items-center text-xs text-muted-foreground mb-3">
                  <MapPin className="h-3 w-3 mr-1" />
                  Remote
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  <Link href="/jobs">View Job</Link>
                </Button>
              </div>
              
              <div className="pt-2">
                <Button variant="link" className="text-sm p-0">
                  <Link href="/jobs">View all jobs</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
