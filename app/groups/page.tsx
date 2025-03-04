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

