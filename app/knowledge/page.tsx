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

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search resources..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <Card key={resource.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <resource.icon className="h-10 w-10 text-primary bg-primary/10 p-2 rounded-lg mr-3" />
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">{resource.type}</div>
                      <div className="font-semibold">{resource.title}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm">{resource.rating}</span>
                  </div>
                </div>
                <div className="text-sm mb-6">
                  <div className="text-muted-foreground mb-1">Industry: {resource.industry}</div>
                  <div className="text-muted-foreground">Author: {resource.author}</div>
                </div>
                <div className="flex justify-between items-center">
                  <Button variant="outline" size="sm">
                    <Download className="mr-1 h-4 w-4" />
                    Download
                    <span className="ml-1 text-xs text-muted-foreground">({resource.downloads})</span>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="mr-1 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}