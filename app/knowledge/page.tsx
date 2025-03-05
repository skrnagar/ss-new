"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, FileText, FileCheck, FilePlus, FileWarning, Filter, Download, Star, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function KnowledgePage() {
  const resources = [
    {
      id: 1,
      title: "Comprehensive HIRA Template",
      type: "HIRA",
      industry: "Manufacturing",
      author: "Sarah Johnson",
      downloads: 1245,
      rating: 4.8,
      icon: FileCheck,
    },
    {
      id: 2,
      title: "Job Safety Analysis for Construction Sites",
      type: "JSA",
      industry: "Construction",
      author: "Michael Chen",
      downloads: 987,
      rating: 4.6,
      icon: FileWarning,
    },
    {
      id: 3,
      title: "Environmental Compliance Checklist 2023",
      type: "Checklist",
      industry: "All Industries",
      author: "Priya Patel",
      downloads: 2156,
      rating: 4.9,
      icon: FileCheck,
    },
    {
      id: 4,
      title: "Safety Plan Template for Chemical Handling",
      type: "Safety Plan",
      industry: "Chemical",
      author: "James Wilson",
      downloads: 876,
      rating: 4.7,
      icon: FilePlus,
    },
    {
      id: 5,
      title: "ISO 14001 Implementation Guide",
      type: "Guide",
      industry: "All Industries",
      author: "Emma Rodriguez",
      downloads: 1532,
      rating: 4.9,
      icon: FileText,
    },
    {
      id: 6,
      title: "Workplace Ergonomics Assessment Tool",
      type: "Assessment",
      industry: "Office",
      author: "David Kim",
      downloads: 765,
      rating: 4.5,
      icon: FileWarning,
    },
  ]

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Knowledge Center</h1>
          <p className="text-muted-foreground">Access and share valuable resources for ESG and EHS professionals</p>
        </div>
        <Button variant="secondary">
          <FilePlus className="mr-2 h-4 w-4" />
          Upload Resource
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-10" placeholder="Search resources..." />
          </div>
        </div>
        <div>
          <Button variant="outline" className="w-full">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <Card key={resource.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="bg-primary/10 p-2 rounded-lg mb-3">
                    <resource.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex space-x-1 mt-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-semibold text-lg line-clamp-1">{resource.title}</h3>
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <span className="bg-secondary px-2 py-0.5 rounded text-secondary-foreground">{resource.type}</span>
                  <span className="mx-2">•</span>
                  <span>{resource.industry}</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">By {resource.author}</div>
                  <div className="flex items-center text-sm">
                    <Download className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-muted-foreground">{resource.downloads}</span>
                    <span className="mx-2">•</span>
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    <span>{resource.rating}</span>
                  </div>
                </div>
              </div>
              <div className="bg-muted p-4 border-t">
                <Button variant="default" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}