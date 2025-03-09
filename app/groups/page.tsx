"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Filter,
  LayoutGrid,
  List,
  MessageSquare,
  Plus,
  Search,
  Users,
} from "lucide-react";
import React from "react";

export default function GroupsPage() {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  const groups = [
    {
      id: 1,
      name: "Renewable Energy Compliance",
      description:
        "Discussion forum for professionals working in renewable energy compliance and regulation.",
      members: 1245,
      posts: 87,
      lastActive: "2 hours ago",
      image: `https://placehold.co/400x200/1f2937/60a5fa?text=Group+1`,
    },
    {
      id: 2,
      name: "Workplace Safety Innovations",
      description:
        "Share and discover innovative approaches to workplace safety and risk management.",
      members: 987,
      posts: 56,
      lastActive: "5 hours ago",
      image: `https://placehold.co/400x200/1f2937/60a5fa?text=Group+2`,
    },
    {
      id: 3,
      name: "ESG Reporting Standards",
      description:
        "Discussions on evolving ESG reporting standards, frameworks, and best practices.",
      members: 1532,
      posts: 112,
      lastActive: "1 day ago",
      image: `https://placehold.co/400x200/1f2937/60a5fa?text=Group+3`,
    },
    {
      id: 4,
      name: "Chemical Safety Management",
      description:
        "Forum for professionals dealing with chemical safety regulations and management systems.",
      members: 876,
      posts: 43,
      lastActive: "3 days ago",
      image: `https://placehold.co/400x200/1f2937/60a5fa?text=Group+4`,
    },
    {
      id: 5,
      name: "ISO Certification Support",
      description:
        "Support group for professionals implementing or maintaining ISO certifications.",
      members: 1245,
      posts: 76,
      lastActive: "12 hours ago",
      image: `https://placehold.co/400x200/1f2937/60a5fa?text=Group+5`,
    },
    {
      id: 6,
      name: "Sustainable Manufacturing",
      description: "For professionals working on sustainable manufacturing practices.",
      members: 1329,
      posts: 91,
      lastActive: "1 day ago",
      image: `https://placehold.co/400x200/1f2937/60a5fa?text=Group+6`,
    },
  ];

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Professional Groups</h1>
          <p className="text-muted-foreground">
            Connect with ESG and EHS professionals in specialized groups
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="w-1/2 md:w-auto" onClick={() => setViewMode("grid")}>
            <LayoutGrid className="mr-2 h-4 w-4" />
            Grid
          </Button>
          <Button variant="outline" className="w-1/2 md:w-auto" onClick={() => setViewMode("list")}>
            <List className="mr-2 h-4 w-4" />
            List
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for groups by name, topic, or keyword..."
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Button variant="outline" className="w-full">
            <Filter className="mr-2 h-4 w-4" />
            Filter Groups
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Groups</TabsTrigger>
          <TabsTrigger value="my">My Groups</TabsTrigger>
          <TabsTrigger value="environmental">Environmental</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <Card key={group.id} className="overflow-hidden">
                  <div className="h-40 overflow-hidden">
                    <img
                      src={group.image || "/placeholder.svg"}
                      alt={group.name}
                      className="w-full h-full object-cover"
                    />
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
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group.id} className="flex items-center border rounded-md p-4">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium">{group.name}</h3>
                      <Badge variant="outline">Environmental</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{group.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{group.members} members</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{group.posts} posts</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Last active {group.lastActive}</span>
                      </div>
                    </div>
                  </div>
                  <Button>Join Group</Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my">
          <div className="space-y-4">
            <div className="flex items-center border rounded-md p-4">
              <div className="bg-primary/10 p-2 rounded-full mr-4">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium">ESG Reporting Standards</h3>
                  <Badge>Governance</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  Discussions on evolving ESG reporting standards and frameworks
                </p>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>1,532 members</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>Very active discussions</span>
                  </div>
                </div>
              </div>
              <Button variant="outline">Leave Group</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
