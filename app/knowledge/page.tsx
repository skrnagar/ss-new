
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
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Knowledge Hub</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search resources..." 
            className="pl-10" 
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <Card key={resource.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="mb-4 flex justify-between items-start">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <resource.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-medium">{resource.rating}</span>
                  </div>
                </div>
                <h3 className="font-semibold mb-1">{resource.title}</h3>
                <div className="text-sm text-muted-foreground mb-4">
                  <span className="inline-block bg-primary/10 text-primary text-xs font-medium py-0.5 px-2 rounded mr-2">
                    {resource.type}
                  </span>
                  <span>{resource.industry}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    By {resource.author}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Download className="h-4 w-4" />
                    {resource.downloads}
                  </div>
                </div>
              </div>
              <div className="flex border-t">
                <Button className="flex-1 rounded-none" variant="ghost">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button className="flex-1 rounded-none" variant="ghost">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
