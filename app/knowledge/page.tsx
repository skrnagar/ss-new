"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Search, 
  Upload, 
  Filter, 
  Clock, 
  Download, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  BookOpen, 
  CheckSquare, 
  AlertTriangle, 
  Shield, 
  FileSpreadsheet,
  FileImage,
  FileCheck,
  FilePlus,
  FileWarning,
  Star
} from "lucide-react"

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
    <div className="container py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Center</h1>
          <p className="text-muted-foreground mt-1">
            Access and share valuable EHS and ESG resources
          </p>
        </div>
        <Button className="bg-secondary text-white">
          <Upload className="h-4 w-4 mr-2" />
          Contribute Resource
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Resource Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start font-normal">
                <BookOpen className="h-4 w-4 mr-2" />
                All Resources
              </Button>
              <Button variant="ghost" className="w-full justify-start font-normal">
                <CheckSquare className="h-4 w-4 mr-2" />
                Risk Assessments
              </Button>
              <Button variant="ghost" className="w-full justify-start font-normal">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Safety Plans
              </Button>
              <Button variant="ghost" className="w-full justify-start font-normal">
                <Shield className="h-4 w-4 mr-2" />
                Compliance Documents
              </Button>
              <Button variant="ghost" className="w-full justify-start font-normal">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Templates
              </Button>
              <Button variant="ghost" className="w-full justify-start font-normal">
                <FileImage className="h-4 w-4 mr-2" />
                Infographics
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Filter Resources</CardTitle>
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
                  <div className="text-sm font-medium mb-2">Document Type</div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="type-pdf" className="h-4 w-4 rounded border-gray-300 mr-2" />
                      <label htmlFor="type-pdf" className="text-sm">PDF</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="type-doc" className="h-4 w-4 rounded border-gray-300 mr-2" />
                      <label htmlFor="type-doc" className="text-sm">Word Document</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="type-xlsx" className="h-4 w-4 rounded border-gray-300 mr-2" />
                      <label htmlFor="type-xlsx" className="text-sm">Excel Spreadsheet</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="type-ppt" className="h-4 w-4 rounded border-gray-300 mr-2" />
                      <label htmlFor="type-ppt" className="text-sm">PowerPoint</label>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Date Added</div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="radio" id="date-week" name="date-filter" className="h-4 w-4 rounded-full border-gray-300 mr-2" />
                      <label htmlFor="date-week" className="text-sm">Last 7 Days</label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="date-month" name="date-filter" className="h-4 w-4 rounded-full border-gray-300 mr-2" />
                      <label htmlFor="date-month" className="text-sm">Last 30 Days</label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="date-quarter" name="date-filter" className="h-4 w-4 rounded-full border-gray-300 mr-2" />
                      <label htmlFor="date-quarter" className="text-sm">Last 90 Days</label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="date-all" name="date-filter" className="h-4 w-4 rounded-full border-gray-300 mr-2" defaultChecked />
                      <label htmlFor="date-all" className="text-sm">All Time</label>
                    </div>
                  </div>
                </div>

                <Button className="w-full">Apply Filters</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Popular Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-secondary/10">ISO 45001</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-secondary/10">HIRA</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-secondary/10">JSA</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-secondary/10">Risk Assessment</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-secondary/10">SDS</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-secondary/10">OSHA</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-secondary/10">ESG Reporting</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-secondary/10">Templates</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-secondary/10">Sustainability</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-secondary/10">Carbon Footprint</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-secondary/10">Audit</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-secondary/10">Training</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-9">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search for resources..." className="pl-9" />
                </div>
                <Button variant="outline" className="md:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Search
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="featured">
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="featured">Featured</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="my-downloads">My Downloads</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="featured" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="bg-primary/10 p-2 rounded-md w-fit mb-2">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">ISO 45001 Implementation Guide</CardTitle>
                    <CardDescription>Comprehensive guide to implementing ISO 45001</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <div className="flex items-center text-muted-foreground">
                        <FileText className="h-3 w-3 mr-1" />
                        <span>PDF • 4.2 MB</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Download className="h-3 w-3 mr-1" />
                        <span>452 downloads</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Added 3 months ago by John Doe</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      <Badge variant="outline" className="text-xs">ISO 45001</Badge>
                      <Badge variant="outline" className="text-xs">Safety</Badge>
                      <Badge variant="outline" className="text-xs">Management Systems</Badge>
                    </div>
                  </CardContent>
                  <div className="px-6 pb-6">
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="bg-primary/10 p-2 rounded-md w-fit mb-2">
                      <FileSpreadsheet className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Environmental Compliance Checklist</CardTitle>
                    <CardDescription>Regulatory compliance tracking template</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <div className="flex items-center text-muted-foreground">
                        <FileText className="h-3 w-3 mr-1" />
                        <span>Excel • 1.8 MB</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Download className="h-3 w-3 mr-1" />
                        <span>327 downloads</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Added 5 months ago by Sarah Johnson</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      <Badge variant="outline" className="text-xs">Environmental</Badge>
                      <Badge variant="outline" className="text-xs">Compliance</Badge>
                      <Badge variant="outline" className="text-xs">Template</Badge>
                    </div>
                  </CardContent>
                  <div className="px-6 pb-6">
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="bg-primary/10 p-2 rounded-md w-fit mb-2">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Safety Audit Templates Bundle</CardTitle>
                    <CardDescription>Collection of safety audit templates and forms</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <div className="flex items-center text-muted-foreground">
                        <FileText className="h-3 w-3 mr-1" />
                        <span>ZIP • 8.6 MB</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Download className="h-3 w-3 mr-1" />
                        <span>716 downloads</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Added 8 months ago by Michael Chen</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      <Badge variant="outline" className="text-xs">Audit</Badge>
                      <Badge variant="outline" className="text-xs">Safety</Badge>
                      <Badge variant="outline" className="text-xs">Templates</Badge>
                    </div>
                  </CardContent>
                  <div className="px-6 pb-6">
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="recent" className="mt-0">
              <div className="p-12 text-center text-muted-foreground">
                Select this tab to see recently added resources
              </div>
            </TabsContent>

            <TabsContent value="popular" className="mt-0">
              <div className="p-12 text-center text-muted-foreground">
                Select this tab to see the most popular resources
              </div>
            </TabsContent>

            <TabsContent value="my-downloads" className="mt-0">
              <div className="p-12 text-center text-muted-foreground">
                Select this tab to see your downloaded resources
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}