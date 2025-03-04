
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
        "Just wrapped up our quarterly ESG compliance audit at GreenTech. Proud to report we've reduced our carbon footprint by 15% compared to last year. Key improvements included optimized waste management and energy-efficient lighting installations. #SustainableBusiness #ESGCompliance",
      likes: 42,
      comments: 7,
      shares: 3,
      image: "/placeholder.jpg",
    },
    {
      id: 2,
      author: "Michael Rodriguez",
      role: "Safety Director",
      company: "Construction Experts Inc.",
      location: "Chicago, IL",
      time: "Yesterday",
      content:
        "Excited to share our latest JSA template for high-risk confined space operations. This updated version includes enhanced risk assessment matrices and more detailed control measures based on our learnings from the past year. Feel free to download and adapt for your team! #SafetyFirst #ConfinedSpace",
      likes: 28,
      comments: 12,
      shares: 18,
    },
    {
      id: 3,
      author: "Emma Williams",
      role: "Environmental Specialist",
      company: "EcoSolutions",
      location: "Portland, OR",
      time: "3 days ago",
      content:
        "Looking for recommendations on the best software for tracking environmental compliance across multiple sites. We're expanding operations and need a scalable solution that integrates well with our existing ERP. Any suggestions from the community? #ComplianceSoftware #MultiSiteManagement",
      likes: 15,
      comments: 23,
      shares: 2,
    },
  ])

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Sidebar */}
        <div className="hidden md:block">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-1 mb-6">
                <h3 className="font-semibold">Your Profile</h3>
                <div className="flex items-center mt-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200 mr-3">
                    <img src="/placeholder-user.jpg" alt="User" className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div>
                    <p className="font-medium">Jamie Smith</p>
                    <p className="text-sm text-muted-foreground">EHS Manager</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1 mb-6">
                <h3 className="font-semibold">Trending Topics</h3>
                <ul className="space-y-2 mt-2">
                  <li>
                    <a href="#" className="text-primary hover:underline text-sm">
                      #ESGReporting
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline text-sm">
                      #SafetyInnovation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline text-sm">
                      #ClimateRiskManagement
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline text-sm">
                      #WorkplaceWellness
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline text-sm">
                      #ISO45001
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold">Groups You Follow</h3>
                <ul className="space-y-2 mt-2">
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-200 mr-2"></div>
                    <a href="#" className="text-sm hover:text-primary">
                      Sustainable Manufacturing
                    </a>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-200 mr-2"></div>
                    <a href="#" className="text-sm hover:text-primary">
                      ESG Professionals Network
                    </a>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-200 mr-2"></div>
                    <a href="#" className="text-sm hover:text-primary">
                      Construction Safety Experts
                    </a>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Feed */}
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-gray-200">
                  <img src="/placeholder-user.jpg" alt="User" className="w-full h-full rounded-full object-cover" />
                </div>
                <Input placeholder="Share an update or resource..." className="flex-1" />
              </div>
              <div className="flex items-center justify-between mt-4 pt-2 border-t">
                <Button variant="ghost" size="sm">
                  <Image className="h-4 w-4 mr-2" />
                  Photo
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </Button>
                <Button variant="ghost" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Document
                </Button>
                <Button variant="primary" size="sm">
                  Post
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Posts */}
          {posts.map((post) => (
            <Card key={post.id} className="mb-6">
              <CardContent className="p-4">
                {/* Post Header */}
                <div className="flex items-start mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 mr-3">
                    <img
                      src={`/placeholder-user.jpg?${post.id}`}
                      alt={post.author}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{post.author}</h4>
                    <p className="text-sm text-muted-foreground">
                      {post.role} at {post.company}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {post.location} • {post.time}
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div>
                  <p className="mb-3">{post.content}</p>
                  {post.image && (
                    <div className="mb-3 bg-gray-100 rounded-md overflow-hidden">
                      <img src={post.image} alt="Post image" className="w-full h-auto max-h-96 object-cover" />
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-3 border-t mt-3">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Like ({post.likes})
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Comment ({post.comments})
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share ({post.shares})
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
