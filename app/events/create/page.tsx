
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  CalendarIcon, 
  Clock, 
  Globe, 
  Info, 
  MapPin, 
  Upload, 
  Users,
  Save,
  X
} from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"

export default function CreateEventPage() {
  const router = useRouter()
  const [eventType, setEventType] = useState("in-person")
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // In a real app, you'd submit the form data to your backend here
    
    toast({
      title: "Event created successfully",
      description: "Your event has been submitted for review."
    })
    
    // Navigate back to events page
    setTimeout(() => {
      router.push("/events")
    }, 1500)
  }
  
  return (
    <div className="container py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create an Event</h1>
        <p className="text-muted-foreground">Share your knowledge and connect with other professionals</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>Provide the basic information about your event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input id="title" placeholder="Give your event a clear and descriptive title" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe what your event is about and why people should attend" 
                    className="min-h-32" 
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-type">Event Type *</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="safety">Safety</SelectItem>
                        <SelectItem value="esg">ESG</SelectItem>
                        <SelectItem value="health">Health & Wellbeing</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                        <SelectItem value="professional">Professional Development</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conference">Conference</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="webinar">Webinar</SelectItem>
                        <SelectItem value="networking">Networking</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="panel">Panel Discussion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Tags (Select up to 5)</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Workplace Safety", "Environmental", "Social", "Governance", "Mental Health", 
                      "Risk Assessment", "ISO Standards", "Leadership", "Sustainability", "Compliance",
                      "OSHA", "Process Safety", "ESG Reporting", "Incident Investigation", "Emergency Response"].map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox id={`tag-${tag}`} />
                        <label
                          htmlFor={`tag-${tag}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {tag}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Event Image</Label>
                  <div className="border-2 border-dashed rounded-md p-4 text-center">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Drag and drop an image, or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">Recommended size: 1200 x 630 pixels</p>
                    <Input id="image" type="file" className="hidden" />
                    <Button variant="outline" size="sm" className="mt-2">Upload Image</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Date & Time</CardTitle>
                <CardDescription>When will your event take place?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date *</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="start-date" type="date" className="pl-10" required />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start Time *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="start-time" type="time" className="pl-10" required />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date *</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="end-date" type="date" className="pl-10" required />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="end-time">End Time *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="end-time" type="time" className="pl-10" required />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Time Zone *</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="est">Eastern Time (ET)</SelectItem>
                      <SelectItem value="cst">Central Time (CT)</SelectItem>
                      <SelectItem value="mst">Mountain Time (MT)</SelectItem>
                      <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                      <SelectItem value="utc">Coordinated Universal Time (UTC)</SelectItem>
                      <SelectItem value="ist">India Standard Time (IST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>Where will your event take place?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <RadioGroup defaultValue="in-person" onValueChange={setEventType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="in-person" id="in-person" />
                      <Label htmlFor="in-person" className="font-normal">In-person event</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="virtual" id="virtual" />
                      <Label htmlFor="virtual" className="font-normal">Virtual event</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hybrid" id="hybrid" />
                      <Label htmlFor="hybrid" className="font-normal">Hybrid event</Label>
                    </div>
                  </RadioGroup>
                  
                  {(eventType === "in-person" || eventType === "hybrid") && (
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="venue">Venue Name *</Label>
                        <Input id="venue" placeholder="e.g., Conference Center, Hotel Name" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address">Address *</Label>
                        <Input id="address" placeholder="Street address" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City *</Label>
                          <Input id="city" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="postal-code">Postal Code *</Label>
                          <Input id="postal-code" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="state">State/Province *</Label>
                          <Input id="state" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="country">Country *</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="us">United States</SelectItem>
                              <SelectItem value="ca">Canada</SelectItem>
                              <SelectItem value="uk">United Kingdom</SelectItem>
                              <SelectItem value="in">India</SelectItem>
                              {/* Add more countries as needed */}
                              <SelectItem value="au">Australia</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {(eventType === "virtual" || eventType === "hybrid") && (
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="platform">
                          Virtual Platform *
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 inline ml-1 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>The platform you'll use to host your virtual event</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="zoom">Zoom</SelectItem>
                            <SelectItem value="teams">Microsoft Teams</SelectItem>
                            <SelectItem value="meet">Google Meet</SelectItem>
                            <SelectItem value="webex">Cisco Webex</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="link">
                          Virtual Event Link
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 inline ml-1 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>You can add this now or later</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <Input id="link" placeholder="https://..." />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visibility & Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="visibility">Who can see this event?</Label>
                  <Select defaultValue="public">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="connections">My Connections</SelectItem>
                      <SelectItem value="group">Specific Group</SelectItem>
                      <SelectItem value="private">Private (Invite Only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="capacity">Attendee Capacity</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="capacity" type="number" min="1" className="pl-10" placeholder="Leave blank for unlimited" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="approval" />
                    <label
                      htmlFor="approval"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Require approval for attendees
                    </label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="reminders" defaultChecked />
                    <label
                      htmlFor="reminders"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Send reminders to attendees
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Event Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="organizer">Event Organizer</Label>
                  <Input id="organizer" placeholder="Name or organization" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input id="email" type="email" placeholder="For attendee inquiries" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Phone (Optional)</Label>
                  <Input id="phone" placeholder="+1 234 567 8901" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
      </form>
    </div>
  )
}
