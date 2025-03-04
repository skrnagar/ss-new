import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Users, MessageSquare, Calendar, Filter, Plus } from "lucide-react"

export default function GroupsPage() {
  const groups = [
    {
      id: 1,
      name: "Renewable Energy Compliance",
      description: "Discussion forum for professionals working in renewable energy compliance and regulation.",
      members: 1245,
      posts: 87,
      lastActive: "2 hours ago",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 2,
      title: "Workplace Safety Innovations",
      description: "Share and discover innovative approaches to workplace safety and risk management.",
      members: 987,
      posts: 56,
      lastActive: "5 hours ago",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 3,
      name: "ESG Reporting Standards",
      description: "Discussions on evolving ESG reporting standards, frameworks, and best practices.",
      members: 1532,
      posts: 112,
      lastActive: "1 day ago",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 4,
      name: "Chemical Safety Management",
      description: "Forum for professionals dealing with chemical safety regulations and management systems.",
      members: 876,
      posts: 43,
      lastActive: "3 days ago",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 5,
      name: "ISO Certification Support",
      description: "Support group for professionals implementing or maintaining ISO certifications.",
      members: 1245,
      posts: 76,
      lastActive: "12 hours ago",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 6,
      name: "Sustainable Supply Chain",
      description: "Discussions on creating and managing sustainable and ethical supply chains.",
      members: 765,
      posts: 34,
      lastActive: "2 days ago",
      image: "/placeholder.svg?height=200&width=400",
    },
  ]

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Groups</h1>
          <p className="text-muted-foreground">Join and participate in specialized ESG and EHS professional groups</p>
        </div>
        <Button variant="secondary">
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search for groups by name, topic, or keyword..." className="pl-10" />
          </div>
        </div>
        <div>
          <Button variant="outline" className="w-full">
            <Filter className="mr-2 h-4 w-4" />
            Filter Groups
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card key={group.id} className="overflow-hidden">
            <div className="h-40 overflow-hidden">
              <img src={group.image || "/placeholder.svg"} alt={group.name} className="w-full h-full object-cover" />
            </div>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-2">{group.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{group.description}</p>

              <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{group.members} members</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>{group.posts} posts</span>
                </div>
              </div>

              <div className="flex items-center text-xs text-muted-foreground mb-4">
                <Calendar className="h-3 w-3 mr-1" />
                <span>Last active {group.lastActive}</span>
              </div>

              <Button variant="secondary" className="w-full">
                Join Group
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Search, Plus, MessageSquare, Calendar, FileText, Settings, Grid, List, Filter } from "lucide-react"
import Link from "next/link"

export default function GroupsPage() {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  
  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Professional Groups</h1>
          <p className="text-muted-foreground mt-1">
            Connect with industry peers and join specialized discussions
          </p>
        </div>
        <Button className="bg-secondary text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">My Groups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search groups..." className="pl-8" />
              </div>
              
              <div className="space-y-1 pt-2">
                <Button variant="ghost" className="w-full justify-start font-normal">
                  <Users className="h-4 w-4 mr-2" />
                  All Groups
                </Button>
                <Button variant="ghost" className="w-full justify-start font-normal">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  My Discussions
                </Button>
                <Button variant="ghost" className="w-full justify-start font-normal">
                  <Calendar className="h-4 w-4 mr-2" />
                  Upcoming Events
                </Button>
                <Button variant="ghost" className="w-full justify-start font-normal">
                  <FileText className="h-4 w-4 mr-2" />
                  Shared Documents
                </Button>
                <Button variant="ghost" className="w-full justify-start font-normal">
                  <Settings className="h-4 w-4 mr-2" />
                  Group Settings
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Filter Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Industry</div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="industry-construction" className="h-4 w-4 rounded border-gray-300 mr-2" />
                      <label htmlFor="industry-construction" className="text-sm">Construction</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="industry-manufacturing" className="h-4 w-4 rounded border-gray-300 mr-2" />
                      <label htmlFor="industry-manufacturing" className="text-sm">Manufacturing</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="industry-energy" className="h-4 w-4 rounded border-gray-300 mr-2" />
                      <label htmlFor="industry-energy" className="text-sm">Energy</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="industry-healthcare" className="h-4 w-4 rounded border-gray-300 mr-2" />
                      <label htmlFor="industry-healthcare" className="text-sm">Healthcare</label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-2">Focus Area</div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="focus-safety" className="h-4 w-4 rounded border-gray-300 mr-2" />
                      <label htmlFor="focus-safety" className="text-sm">Safety</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="focus-environmental" className="h-4 w-4 rounded border-gray-300 mr-2" />
                      <label htmlFor="focus-environmental" className="text-sm">Environmental</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="focus-social" className="h-4 w-4 rounded border-gray-300 mr-2" />
                      <label htmlFor="focus-social" className="text-sm">Social Governance</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="focus-compliance" className="h-4 w-4 rounded border-gray-300 mr-2" />
                      <label htmlFor="focus-compliance" className="text-sm">Compliance</label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-2">Group Size</div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="size-small" className="h-4 w-4 rounded border-gray-300 mr-2" />
                      <label htmlFor="size-small" className="text-sm">Small (< 100 members)</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="size-medium" className="h-4 w-4 rounded border-gray-300 mr-2" />
                      <label htmlFor="size-medium" className="text-sm">Medium (100-1,000 members)</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="size-large" className="h-4 w-4 rounded border-gray-300 mr-2" />
                      <label htmlFor="size-large" className="text-sm">Large (1,000+ members)</label>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full">Apply Filters</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-9">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Discover Groups</CardTitle>
                  <CardDescription>Find the perfect group to enhance your professional network</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setViewMode("grid")} className={viewMode === "grid" ? "bg-muted" : ""}>
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setViewMode("list")} className={viewMode === "list" ? "bg-muted" : ""}>
                    <List className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Sort
                  </Button>
                </div>
              </div>
              
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All Groups</TabsTrigger>
                  <TabsTrigger value="my">My Groups</TabsTrigger>
                  <TabsTrigger value="recommended">Recommended</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <Badge>Safety</Badge>
                      </div>
                      <CardTitle className="text-lg mt-2">ISO 45001 Implementers</CardTitle>
                      <CardDescription>A group for professionals implementing ISO 45001 safety management systems</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>1,872 members</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>Active discussions</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Join Group</Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <Badge variant="outline">Environmental</Badge>
                      </div>
                      <CardTitle className="text-lg mt-2">Renewable Energy Compliance</CardTitle>
                      <CardDescription>For professionals in renewable energy compliance and regulation</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>3,241 members</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>Very active discussions</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Join Group</Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <Badge variant="outline">Governance</Badge>
                      </div>
                      <CardTitle className="text-lg mt-2">ESG Professionals Network</CardTitle>
                      <CardDescription>Connect with ESG professionals across industries</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>5,129 members</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>Extremely active discussions</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" variant="outline">Leave Group</Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <Badge variant="outline">Safety</Badge>
                      </div>
                      <CardTitle className="text-lg mt-2">Construction Safety Professionals</CardTitle>
                      <CardDescription>A group dedicated to safety in the construction industry</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>2,567 members</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>Active discussions</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Join Group</Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <Badge variant="outline">Environmental</Badge>
                      </div>
                      <CardTitle className="text-lg mt-2">Sustainable Manufacturing</CardTitle>
                      <CardDescription>For professionals working on sustainable manufacturing practices</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>1,329 members</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>Moderately active discussions</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Join Group</Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <Badge variant="outline">Social</Badge>
                      </div>
                      <CardTitle className="text-lg mt-2">Corporate Social Responsibility</CardTitle>
                      <CardDescription>Discussing best practices in corporate social responsibility</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>2,145 members</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>Very active discussions</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Join Group</Button>
                    </CardFooter>
                  </Card>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center border rounded-md p-4">
                    <div className="bg-primary/10 p-2 rounded-full mr-4">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium">ISO 45001 Implementers</h3>
                        <Badge>Safety</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">A group for professionals implementing ISO 45001 safety management systems</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>1,872 members</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>Active discussions</span>
                        </div>
                      </div>
                    </div>
                    <Button>Join Group</Button>
                  </div>
                  
                  <div className="flex items-center border rounded-md p-4">
                    <div className="bg-primary/10 p-2 rounded-full mr-4">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium">Renewable Energy Compliance</h3>
                        <Badge variant="outline">Environmental</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">For professionals in renewable energy compliance and regulation</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>3,241 members</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>Very active discussions</span>
                        </div>
                      </div>
                    </div>
                    <Button>Join Group</Button>
                  </div>
                  
                  <div className="flex items-center border rounded-md p-4">
                    <div className="bg-primary/10 p-2 rounded-full mr-4">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium">ESG Professionals Network</h3>
                        <Badge variant="outline">Governance</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">Connect with ESG professionals across industries</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>5,129 members</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>Extremely active discussions</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline">Leave Group</Button>
                  </div>
                  
                  <div className="flex items-center border rounded-md p-4">
                    <div className="bg-primary/10 p-2 rounded-full mr-4">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium">Construction Safety Professionals</h3>
                        <Badge variant="outline">Safety</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">A group dedicated to safety in the construction industry</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>2,567 members</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>Active discussions</span>
                        </div>
                      </div>
                    </div>
                    <Button>Join Group</Button>
                  </div>
                  
                  <div className="flex items-center border rounded-md p-4">
                    <div className="bg-primary/10 p-2 rounded-full mr-4">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium">Sustainable Manufacturing</h3>
                        <Badge variant="outline">Environmental</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">For professionals working on sustainable manufacturing practices</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>1,329 members</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>Moderately active discussions</span>
                        </div>
                      </div>
                    </div>
                    <Button>Join Group</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
