
"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, MessageSquare, Share, Users, BookOpen, Briefcase, Award, ClipboardCheck, Leaf, BarChart, Heart, Image, FileText, Link2, Smile } from "lucide-react"

export default function FeedPage() {
  const [postContent, setPostContent] = useState("")
  
  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3 hidden lg:block">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile</CardTitle>
              <CardDescription>Your professional information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarImage src="/placeholder-user.jpg" alt="Your Name" />
                  <AvatarFallback>YN</AvatarFallback>
                </Avatar>
                <h3 className="font-medium text-lg">Your Name</h3>
                <p className="text-sm text-muted-foreground text-center">
                  EHS Manager at Global Safety Solutions
                </p>
              </div>
              <Separator />
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Profile views</p>
                  <p className="text-sm text-muted-foreground">38 views this week</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Post impressions</p>
                  <p className="text-sm text-muted-foreground">412 views on your posts</p>
                </div>
              </div>
              <Button className="w-full" variant="outline">
                View Profile
              </Button>
            </CardContent>
          </Card>
        </aside>
        
        <main className="lg:col-span-6 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <Textarea 
                placeholder="Share an update, resource, or safety insight..." 
                className="mb-4 resize-none"
                value={postContent}
                onChange={e => setPostContent(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Image className="h-4 w-4" />
                  Photo
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Document
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Link2 className="h-4 w-4" />
                  Link
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Smile className="h-4 w-4" />
                  Poll
                </Button>
                <div className="flex-1"></div>
                <Button disabled={!postContent.trim()}>Post</Button>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="all">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-6 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex space-x-4 mb-4">
                    <Avatar>
                      <AvatarImage src="/placeholder-user.jpg" alt="John Doe" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">John Doe</h3>
                        <Badge variant="outline" className="text-xs">HSE Professional</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Global Safety Solutions</p>
                      <p className="text-xs text-muted-foreground">Posted 2 hours ago</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p>Excited to share our latest case study on how we implemented a new safety management system that reduced workplace incidents by 45% over the past year. #SafetyInnovation #RiskManagement</p>
                  </div>
                  <div className="rounded-md overflow-hidden mb-4">
                    <img src="/placeholder.jpg" alt="Safety dashboard" className="w-full h-auto" />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-4">
                    <span>24 likes</span>
                    <span>12 comments</span>
                  </div>
                  <div className="flex border-t pt-4">
                    <Button variant="ghost" size="sm" className="flex-1">
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Like
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Comment
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex space-x-4 mb-4">
                    <Avatar>
                      <AvatarImage src="/placeholder-user.jpg" alt="Sarah Johnson" />
                      <AvatarFallback>SJ</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Sarah Johnson</h3>
                        <Badge variant="outline" className="text-xs">EHS Director</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Sustainable Manufacturing Inc.</p>
                      <p className="text-xs text-muted-foreground">Posted 5 hours ago</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p>I'm looking for recommendations on the best software for tracking environmental compliance. We're a mid-sized manufacturing company with operations in 3 states. Any suggestions from the community?</p>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-4">
                    <span>8 likes</span>
                    <span>17 comments</span>
                  </div>
                  <div className="flex border-t pt-4">
                    <Button variant="ghost" size="sm" className="flex-1">
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Like
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Comment
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="network">
              <div className="py-12 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">Connect with more professionals</h3>
                <p className="max-w-md mx-auto mb-6">Grow your network to see more relevant content from ESG & EHS professionals</p>
                <Button>Find Connections</Button>
              </div>
            </TabsContent>
            <TabsContent value="trending">
              <div className="py-12 text-center text-muted-foreground">
                <BarChart className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">Trending content coming soon</h3>
                <p className="max-w-md mx-auto">We're still gathering trending content in your area of expertise.</p>
              </div>
            </TabsContent>
          </Tabs>
        </main>
        
        <aside className="lg:col-span-3 hidden lg:block space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Industry News</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm">New ISO 45001 Updates Coming in 2023</h4>
                <p className="text-xs text-muted-foreground">6,245 professionals talking about this</p>
              </div>
              <div>
                <h4 className="font-medium text-sm">EU Passes New Climate Disclosure Requirements</h4>
                <p className="text-xs text-muted-foreground">4,123 professionals talking about this</p>
              </div>
              <div>
                <h4 className="font-medium text-sm">OSHA Releases Guidance on Workplace Heat Stress</h4>
                <p className="text-xs text-muted-foreground">3,872 professionals talking about this</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="w-full">View All News</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm">Global Safety Summit 2023</h4>
                <p className="text-xs text-muted-foreground">June 12-15 • Virtual</p>
              </div>
              <div>
                <h4 className="font-medium text-sm">ESG Reporting Workshop</h4>
                <p className="text-xs text-muted-foreground">July 8 • Chicago, IL</p>
              </div>
              <div>
                <h4 className="font-medium text-sm">Sustainability Leadership Forum</h4>
                <p className="text-xs text-muted-foreground">August 22-24 • Boston, MA</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="w-full">View All Events</Button>
            </CardFooter>
          </Card>
        </aside>
      </div>
    </div>
  )
}
