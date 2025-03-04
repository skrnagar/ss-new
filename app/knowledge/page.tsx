"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, FileText, FileCheck, FilePlus, FileWarning, Filter, Download, Star, Share2 } from "lucide-react"

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
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Knowledge Hub</h1>
          <p className="text-muted-foreground">
            Access and share ESG & EHS resources, templates, and best practices
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <FilePlus className="h-4 w-4 mr-2" />
            Upload Resource
          </Button>
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          className="pl-10"
          placeholder="Search for resources, templates, or topics..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <Card key={resource.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <resource.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex items-center text-amber-500">
                    <Star className="fill-current h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">{resource.rating}</span>
                  </div>
                </div>
                <h3 className="font-semibold mb-1 line-clamp-2">{resource.title}</h3>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <span className="bg-muted px-2 py-0.5 rounded text-xs mr-2">{resource.type}</span>
                  <span>{resource.industry}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">By {resource.author}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Download className="h-4 w-4 mr-1" />
                    <span>{resource.downloads}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm">Download</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}