"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Calendar,
  Clock,
  Filter,
  Globe,
  LayoutGrid,
  List,
  MapPin,
  Plus,
  Search,
  Share2,
  Tag,
  Users,
  Video,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Sample data for upcoming safety and ESG events
const safetyEventsData = [
  {
    id: 1,
    title: "National Safety Day Conference", //Updated Title
    description: "Annual celebration focused on renewing commitment to workplace safety.",
    date: "March 4, 2025",
    time: "9:00 AM - 5:00 PM",
    location: "Virtual",
    organizer: "National Safety Council",
    attendees: 456,
    type: "safety",
    category: "observance",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=Event+${1}`,
  },
  {
    id: 2,
    title: "ESG Reporting Framework Summit",
    description: "Learn about the latest developments in ESG reporting standards and frameworks.",
    date: "April 15, 2025",
    time: "10:00 AM - 4:00 PM",
    location: "New York, NY",
    organizer: "KeyESG",
    attendees: 325,
    type: "esg",
    category: "conference",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=Event+${2}`,
  },
  {
    id: 3,
    title: "World Environment Day Observance", //Updated Title
    description: "Global event to raise awareness and action for the protection of our environment.",
    date: "June 5, 2025",
    time: "All Day",
    location: "Worldwide",
    organizer: "United Nations",
    attendees: 1289,
    type: "esg",
    category: "observance",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=Event+${3}`,
  },
  {
    id: 4,
    title: "Construction Safety Workshop",
    description: "Hands-on training for construction safety professionals.",
    date: "July 12, 2025",
    time: "8:00 AM - 3:00 PM",
    location: "Chicago, IL",
    organizer: "Construction Industry Federation",
    attendees: 178,
    type: "safety",
    category: "workshop",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=Event+${4}`,
  },
  {
    id: 5,
    title: "Mental Health Awareness Month Kickoff Webinar", //Updated Title
    description: "Opening session for mental health awareness initiatives in the workplace.",
    date: "May 1, 2025",
    time: "11:00 AM - 1:00 PM",
    location: "Virtual",
    organizer: "Safety Shaper",
    attendees: 234,
    type: "health",
    category: "webinar",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=Event+${5}`,
  },
  {
    id: 6,
    title: "Sustainable Supply Chain Conference",
    description: "Explore best practices for creating sustainable and ethical supply chains.",
    date: "September 9, 2025",
    time: "9:00 AM - 6:00 PM",
    location: "Boston, MA",
    organizer: "Impact Reporting",
    attendees: 415,
    type: "esg",
    category: "conference",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=Event+${6}`,
  },
];

// User-created events
const userEventsData = [
  {
    id: 101,
    title: "Safety Leadership Roundtable",
    description: "Monthly discussion forum for safety professionals to share leadership strategies.",
    date: "February 20, 2025",
    time: "3:00 PM - 4:30 PM",
    location: "Virtual",
    organizer: "Jane Smith, Safety Director",
    attendees: 32,
    type: "safety",
    category: "networking",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=Event+${101}`,
  },
  {
    id: 102,
    title: "ESG Metrics Working Group Session", //Updated Title
    description: "Collaborative session on standardizing ESG metrics for the manufacturing sector.",
    date: "March 15, 2025",
    time: "1:00 PM - 3:00 PM",
    location: "Chicago, IL",
    organizer: "Mark Johnson, ESG Consultant",
    attendees: 18,
    type: "esg",
    category: "workshop",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=Event+${102}`,
  },
];

export default function EventsPage() {
  const [viewMode, setViewMode] = useState("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  // Filtered events based on search and filters
  const getFilteredEvents = (events) => {
    return events.filter(event => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = categoryFilter === "" || event.category === categoryFilter;

      // Type filter
      const matchesType = typeFilter === "" || event.type === typeFilter;

      // Location filter
      const matchesLocation = locationFilter === "" || 
        event.location.toLowerCase().includes(locationFilter.toLowerCase());

      // Date filter (simplified for demo)
      const matchesDate = dateFilter === "" || event.date.includes(dateFilter);

      return matchesSearch && matchesCategory && matchesType && matchesLocation && matchesDate;
    });
  };

  const filteredSafetyEvents = getFilteredEvents(safetyEventsData);
  const filteredUserEvents = getFilteredEvents(userEventsData);

  // Function to render event cards
  const renderEventCard = (event) => (
    <Card className="overflow-hidden" key={event.id}>
      <div className="h-48 overflow-hidden relative">
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge variant={event.type === 'safety' ? 'destructive' : event.type === 'esg' ? 'secondary' : 'default'}>
            {event.type.toUpperCase()}
          </Badge>
        </div>
      </div>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg">{event.title}</CardTitle>
        <CardDescription className="flex items-center gap-1 text-xs">
          <Calendar className="h-3 w-3" /> {event.date} <Clock className="h-3 w-3 ml-2" /> {event.time}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> {event.location}
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3" /> {event.attendees} attendees
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Badge variant="outline">{event.category}</Badge>
        <Button size="sm">Register</Button>
      </CardFooter>
    </Card>
  );

  // Function to render event list item
  const renderEventListItem = (event) => (
    <Card className="mb-3" key={event.id}>
      <CardContent className="p-4 flex gap-4">
        <div className="min-w-24 flex-shrink-0">
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-24 h-24 object-cover rounded-md"
          />
        </div>
        <div className="flex-grow">
          <h3 className="font-medium">{event.title}</h3>
          <div className="flex flex-wrap gap-2 mt-1">
            <Badge variant={event.type === 'safety' ? 'destructive' : event.type === 'esg' ? 'secondary' : 'default'}>
              {event.type.toUpperCase()}
            </Badge>
            <Badge variant="outline">{event.category}</Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{event.description}</p>
          <div className="flex flex-wrap gap-x-4 mt-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" /> {event.date}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> {event.time}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {event.location}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" /> {event.attendees} attendees
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center">
          <Button>Register</Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">Discover and connect with ESG & EHS professionals at upcoming events</p>
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
            Create Event
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="calendar">Calendar Events</TabsTrigger>
          <TabsTrigger value="user">User-Created Events</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search for events by title, description, or keyword..." 
                className="pl-10" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Button variant="outline" className="w-full">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Event Type</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="safety">Safety</SelectItem>
                        <SelectItem value="esg">ESG</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Category</label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="observance">Observance Day</SelectItem>
                        <SelectItem value="conference">Conference</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="webinar">Webinar</SelectItem>
                        <SelectItem value="networking">Networking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Location</label>
                    <Input 
                      placeholder="City or Virtual" 
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Date</label>
                    <Input 
                      placeholder="Month or Year (e.g., March 2025)" 
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                  </div>
                  <Button className="w-full" variant="outline">
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Featured Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="cursor-pointer">Workplace Safety</Badge>
                    <Badge variant="secondary" className="cursor-pointer">Environmental</Badge>
                    <Badge variant="secondary" className="cursor-pointer">Governance</Badge>
                    <Badge variant="secondary" className="cursor-pointer">Mental Health</Badge>
                    <Badge variant="secondary" className="cursor-pointer">Sustainability</Badge>
                    <Badge variant="secondary" className="cursor-pointer">Compliance</Badge>
                    <Badge variant="secondary" className="cursor-pointer">Risk Management</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Event Format</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">In-person Events</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Virtual Events</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Free Events</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="md:col-span-3">
            <TabsContent value="calendar" className="mt-0">
              <h2 className="text-xl font-semibold mb-4">Calendar Events</h2>
              <p className="text-muted-foreground mb-6">Official safety and ESG events from organizations worldwide</p>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSafetyEvents.map(event => renderEventCard(event))}
                </div>
              ) : (
                <div>
                  {filteredSafetyEvents.map(event => renderEventListItem(event))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="user" className="mt-0">
              <h2 className="text-xl font-semibold mb-4">User-Created Events</h2>
              <p className="text-muted-foreground mb-6">Events created by professionals in your network</p>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUserEvents.map(event => renderEventCard(event))}
                </div>
              ) : (
                <div>
                  {filteredUserEvents.map(event => renderEventListItem(event))}
                </div>
              )}

              <div className="mt-8 text-center">
                <Card className="border-dashed">
                  <CardContent className="py-8">
                    <h3 className="text-lg font-medium mb-2">Host your own event</h3>
                    <p className="text-muted-foreground mb-4">Share knowledge or connect with other professionals</p>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Event
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}