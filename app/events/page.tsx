
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
    title: "National Safety Day Conference", 
    description: "Annual celebration focused on renewing commitment to workplace safety practices and policies.",
    date: "March 4, 2025",
    time: "9:00 AM - 5:00 PM",
    location: "Virtual",
    organizer: "National Safety Council",
    attendees: 456,
    type: "safety",
    category: "observance",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("National Safety Day Conference")}`,
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
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("ESG Reporting Framework Summit")}`,
  },
  {
    id: 3,
    title: "World Environment Day Observance", 
    description: "Global event to raise awareness and action for the protection of our environment.",
    date: "June 5, 2025",
    time: "All Day",
    location: "Worldwide",
    organizer: "United Nations",
    attendees: 1289,
    type: "esg",
    category: "observance",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("World Environment Day Observance")}`,
  },
  {
    id: 4,
    title: "Construction Safety Standards Forum",
    description: "Hands-on training for construction safety professionals and discussion of latest standards.",
    date: "July 12, 2025",
    time: "8:00 AM - 3:00 PM",
    location: "Chicago, IL",
    organizer: "Construction Industry Federation",
    attendees: 178,
    type: "safety",
    category: "workshop",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Construction Safety Standards Forum")}`,
  },
  {
    id: 5,
    title: "Mental Health Awareness Month Kickoff Webinar", 
    description: "Opening session for mental health awareness initiatives in the workplace.",
    date: "May 1, 2025",
    time: "11:00 AM - 1:00 PM",
    location: "Virtual",
    organizer: "Safety Shaper",
    attendees: 234,
    type: "health",
    category: "webinar",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Mental Health Awareness Month Kickoff Webinar")}`,
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
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Sustainable Supply Chain Conference")}`,
  },
  {
    id: 7,
    title: "World Day for Safety and Health at Work",
    description: "Annual international campaign to promote safe, healthy and decent work environments.",
    date: "April 28, 2025",
    time: "All Day",
    location: "Worldwide",
    organizer: "International Labour Organization",
    attendees: 875,
    type: "safety",
    category: "observance",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("World Day for Safety and Health at Work")}`,
  },
  {
    id: 8,
    title: "Fire Safety Awareness Week",
    description: "Week-long program focused on fire prevention, preparedness, and response.",
    date: "October 9-15, 2025",
    time: "Various Times",
    location: "Multiple Locations",
    organizer: "National Fire Protection Association",
    attendees: 523,
    type: "safety",
    category: "observance",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Fire Safety Awareness Week")}`,
  },
  {
    id: 9,
    title: "ESG Integration Summit",
    description: "Exploring practical approaches to integrating ESG principles into business operations.",
    date: "May 18-19, 2025",
    time: "9:00 AM - 5:00 PM",
    location: "London, UK",
    organizer: "KeyESG",
    attendees: 342,
    type: "esg",
    category: "conference",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("ESG Integration Summit")}`,
  },
  {
    id: 10,
    title: "Ergonomics in the Workplace Workshop",
    description: "Practical workshop on implementing ergonomic principles to prevent workplace injuries.",
    date: "August 7, 2025",
    time: "1:00 PM - 4:30 PM",
    location: "Dallas, TX",
    organizer: "J.J. Keller Safety",
    attendees: 156,
    type: "safety",
    category: "workshop",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Ergonomics in the Workplace Workshop")}`,
  },
  {
    id: 11,
    title: "Road Safety Week",
    description: "Promoting road safety awareness and practices to reduce accidents and injuries.",
    date: "November 18-24, 2025",
    time: "All Week",
    location: "Nationwide",
    organizer: "National Safety Council India",
    attendees: 629,
    type: "safety",
    category: "observance",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Road Safety Week")}`,
  },
  {
    id: 12,
    title: "Climate Action Conference",
    description: "Focused on business strategies and innovations to address climate change challenges.",
    date: "October 2-3, 2025",
    time: "8:30 AM - 5:30 PM",
    location: "Berlin, Germany",
    organizer: "Impact Reporting",
    attendees: 487,
    type: "esg",
    category: "conference",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Climate Action Conference")}`,
  },
  {
    id: 13,
    title: "World Cancer Day Awareness Program",
    description: "Educational event on cancer prevention, early detection, and support systems.",
    date: "February 4, 2025",
    time: "10:00 AM - 2:00 PM",
    location: "Virtual",
    organizer: "Department of Health",
    attendees: 312,
    type: "health",
    category: "webinar",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("World Cancer Day Awareness Program")}`,
  },
  {
    id: 14,
    title: "OSHA Compliance Update 2025",
    description: "Comprehensive review of new OSHA regulations and compliance requirements.",
    date: "January 23, 2025",
    time: "9:00 AM - 12:00 PM",
    location: "Chicago, IL",
    organizer: "Occupational Safety and Health Administration",
    attendees: 286,
    type: "safety",
    category: "webinar",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("OSHA Compliance Update 2025")}`,
  },
  {
    id: 15,
    title: "Corporate Social Responsibility Symposium",
    description: "Exploring effective CSR strategies and measuring social impact.",
    date: "July 15-16, 2025",
    time: "9:00 AM - 5:00 PM",
    location: "Sydney, Australia",
    organizer: "Impact Reporting",
    attendees: 392,
    type: "esg",
    category: "conference",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Corporate Social Responsibility Symposium")}`,
  }
];

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
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Safety Leadership Roundtable")}`,
  },
  {
    id: 102,
    title: "ESG Metrics Working Group Session", 
    description: "Collaborative session on standardizing ESG metrics for the manufacturing sector.",
    date: "March 15, 2025",
    time: "1:00 PM - 3:00 PM",
    location: "Chicago, IL",
    organizer: "Mark Johnson, ESG Consultant",
    attendees: 18,
    type: "esg",
    category: "workshop",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("ESG Metrics Working Group Session")}`,
  },
  {
    id: 103,
    title: "Hazard Assessment Training Network",
    description: "Peer-to-peer training on effective workplace hazard assessment techniques.",
    date: "April 5, 2025",
    time: "10:00 AM - 12:00 PM",
    location: "Denver, CO",
    organizer: "Robert Chen, Health & Safety Manager",
    attendees: 25,
    type: "safety",
    category: "training",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Hazard Assessment Training Network")}`,
  },
  {
    id: 104,
    title: "Sustainability Reporting Peer Review",
    description: "Collaborative session to review and provide feedback on sustainability reports.",
    date: "May 12, 2025",
    time: "2:00 PM - 4:00 PM",
    location: "Virtual",
    organizer: "Sarah Wong, Sustainability Director",
    attendees: 22,
    type: "esg",
    category: "workshop",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Sustainability Reporting Peer Review")}`,
  },
  {
    id: 105,
    title: "Mental Health First Aid for Managers",
    description: "Skills-based training to identify, understand and respond to mental health issues.",
    date: "June 8, 2025",
    time: "9:00 AM - 4:00 PM",
    location: "Seattle, WA",
    organizer: "Dr. Michael Patel, Workplace Wellness Consultant",
    attendees: 28,
    type: "health",
    category: "training",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Mental Health First Aid for Managers")}`,
  }
];

export default function EventsPage() {
  const [viewMode, setViewMode] = useState("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  // Function to render event list items
  const renderEventListItem = (event) => (
    <Card className="mb-4" key={event.id}>
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/4">
          <img 
            src={event.image} 
            alt={event.title} 
            className="h-40 w-full object-cover md:h-full"
          />
        </div>
        <div className="flex flex-col flex-1 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{event.title}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <Calendar className="h-3 w-3" /> {event.date} <Clock className="h-3 w-3 ml-2" /> {event.time}
              </div>
            </div>
            <Badge variant={event.type === 'safety' ? 'destructive' : event.type === 'esg' ? 'secondary' : 'default'}>
              {event.type.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{event.description}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {event.location}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Users className="h-3 w-3" /> {event.attendees} attendees
          </div>
          <div className="flex justify-between items-center mt-4">
            <Badge variant="outline">{event.category}</Badge>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Share2 className="h-4 w-4 mr-1" /> Share
              </Button>
              <Button size="sm">Register</Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )

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
  )

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

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Safety & ESG Events</h1>
      
      <div className="mb-8 p-4 bg-muted rounded-lg">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="md:ml-auto" onClick={() => window.open('/events/create', '_blank')}>
            <Plus className="mr-2 h-4 w-4" /> Create Event
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="calendar">
        <TabsList className="mb-6">
          <TabsTrigger value="calendar">Calendar Events</TabsTrigger>
          <TabsTrigger value="user">User Events</TabsTrigger>
        </TabsList>

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
                        <SelectItem value="">All Types</SelectItem>
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
                        <SelectItem value="">All Categories</SelectItem>
                        <SelectItem value="conference">Conference</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="webinar">Webinar</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="networking">Networking</SelectItem>
                        <SelectItem value="observance">Observance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Location</label>
                    <Input 
                      placeholder="Filter by location" 
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Date</label>
                    <Input 
                      placeholder="Filter by date" 
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => {
                    setTypeFilter("");
                    setCategoryFilter("");
                    setLocationFilter("");
                    setDateFilter("");
                    setSearchQuery("");
                  }}>
                    <Filter className="mr-2 h-4 w-4" /> Reset Filters
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Popular Organizations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="/placeholder-logo.svg" />
                        <AvatarFallback>NSC</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">National Safety Council</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="/placeholder-logo.svg" />
                        <AvatarFallback>UN</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">United Nations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="/placeholder-logo.svg" />
                        <AvatarFallback>OSHA</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">OSHA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="/placeholder-logo.svg" />
                        <AvatarFallback>IR</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">Impact Reporting</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="/placeholder-logo.svg" />
                        <AvatarFallback>SS</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">Safety Shaper</span>
                    </div>
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
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
