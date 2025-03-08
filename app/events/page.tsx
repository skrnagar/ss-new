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
    title: "National Safety Day/Week Conference", 
    description: "Annual celebration focused on renewing commitment to workplace safety. Part of the National Safety Day/Week (March 4-10) campaign to spread safety awareness in all sectors.",
    date: "March 4, 2025",
    time: "9:00 AM - 5:00 PM",
    location: "New Delhi, India",
    organizer: "National Safety Council",
    attendees: 520,
    type: "safety",
    category: "conference",
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
    title: "Construction Safety Workshop",
    description: "Hands-on training for construction safety professionals.",
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
    title: "Mental Health Awareness Month Kickoff Webinar", //Updated Title
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
    attendees: 890,
    type: "safety",
    category: "observance",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("World Day for Safety and Health at Work")}`,
  },
  {
    id: 8,
    title: "Fire Prevention Week",
    description: "Educational campaign to raise awareness about fire safety and prevention strategies.",
    date: "October 5-11, 2025",
    time: "All Week",
    location: "Nationwide",
    organizer: "National Fire Protection Association",
    attendees: 675,
    type: "safety",
    category: "observance",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Fire Prevention Week")}`,
  },
  {
    id: 9,
    title: "Global Biodiversity Summit",
    description: "International conference addressing biodiversity conservation and sustainable ecosystem management.",
    date: "May 22, 2025",
    time: "9:00 AM - 6:00 PM",
    location: "Sydney, Australia",
    organizer: "UN Environment Programme",
    attendees: 560,
    type: "esg",
    category: "conference",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Global Biodiversity Summit")}`,
  },
  {
    id: 10,
    title: "Road Safety Week",
    description: "Campaign focused on reducing road accidents and promoting safer driving practices.",
    date: "January 10-16, 2025",
    time: "All Week",
    location: "Multiple Cities",
    organizer: "JJ Keller Safety",
    attendees: 530,
    type: "safety",
    category: "observance",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Road Safety Week")}`,
  },
  {
    id: 11,
    title: "World Health Day 2025",
    description: "Global health awareness day under the sponsorship of the World Health Organization.",
    date: "April 7, 2025",
    time: "All Day",
    location: "Worldwide",
    organizer: "World Health Organization",
    attendees: 920,
    type: "health",
    category: "observance",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("World Health Day 2025")}`,
  },
  {
    id: 12,
    title: "Climate Finance Forum",
    description: "Key stakeholders discussing financing solutions for climate action and resilience.",
    date: "November 12, 2025",
    time: "10:00 AM - 5:00 PM",
    location: "London, UK",
    organizer: "KeyESG",
    attendees: 380,
    type: "esg",
    category: "conference",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Climate Finance Forum")}`,
  },
  {
    id: 13,
    title: "International Workers' Memorial Day",
    description: "Day of remembrance and action for workers killed, disabled, injured or made unwell by their work.",
    date: "April 28, 2025",
    time: "All Day",
    location: "Worldwide",
    organizer: "Construction Industry Federation",
    attendees: 450,
    type: "safety",
    category: "observance",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("International Workers' Memorial Day")}`,
  },
  {
    id: 14,
    title: "World No Tobacco Day",
    description: "Annual awareness day highlighting the health risks associated with tobacco use.",
    date: "May 31, 2025",
    time: "All Day",
    location: "Worldwide",
    organizer: "World Health Organization",
    attendees: 620,
    type: "health",
    category: "observance",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("World No Tobacco Day")}`,
  },
  {
    id: 15,
    title: "Sustainable Development Goals Summit",
    description: "High-level political forum on sustainable development with global leaders.",
    date: "July 15-16, 2025",
    time: "9:00 AM - 6:00 PM",
    location: "New York, NY",
    organizer: "United Nations",
    attendees: 780,
    type: "esg",
    category: "conference",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Sustainable Development Goals Summit")}`,
  },
  {
    id: 16,
    title: "National Ladder Safety Month",
    description: "Month-long initiative to raise awareness about ladder safety in the workplace and prevent ladder-related injuries and fatalities.",
    date: "March 1-31, 2025",
    time: "All Month",
    location: "Nationwide",
    organizer: "American Ladder Institute",
    attendees: 450,
    type: "safety",
    category: "observance",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("National Ladder Safety Month")}`,
  },
  {
    id: 17,
    title: "Brain Injury Awareness Month",
    description: "Campaign dedicated to increasing awareness about brain injuries, including prevention, recognition, and response.",
    date: "March 1-31, 2025",
    time: "All Month",
    location: "United States",
    organizer: "Brain Injury Association of America",
    attendees: 380,
    type: "health",
    category: "observance",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Brain Injury Awareness Month")}`,
  },
  {
    id: 18,
    title: "World Sustainable Development Summit",
    description: "The 24th edition focusing on partnerships to catalyze transformative action and advance global sustainability objectives.",
    date: "March 5-7, 2025",
    time: "9:00 AM - 6:00 PM",
    location: "New Delhi, India",
    organizer: "WSDS Secretariat",
    attendees: 690,
    type: "esg",
    category: "conference",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("World Sustainable Development Summit")}`,
  },
  {
    id: 19,
    title: "Sustainability Week & Energy Transition Summit",
    description: "10th anniversary conference focusing on sustaining planet and profit through sustainable business practices.",
    date: "March 10-12, 2025",
    time: "9:00 AM - 5:00 PM",
    location: "London, UK",
    organizer: "Economist Events",
    attendees: 780,
    type: "esg",
    category: "conference",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Sustainability Week Summit")}`,
  },
  {
    id: 20,
    title: "Futurebuild 2025",
    description: "The event for professionals passionate about shaping a sustainable future for the built environment.",
    date: "March 4-6, 2025",
    time: "9:00 AM - 5:00 PM",
    location: "ExCeL, London, UK",
    organizer: "Easyfairs Group",
    attendees: 870,
    type: "esg",
    category: "conference",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Futurebuild 2025")}`,
  },
  {
    id: 21,
    title: "National Patient Safety Awareness Week",
    description: "Raises awareness about healthcare safety for both patients and the healthcare workforce.",
    date: "March 9-15, 2025",
    time: "All Week",
    location: "Nationwide",
    organizer: "National Patient Safety Foundation",
    attendees: 420,
    type: "health",
    category: "observance",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Patient Safety Awareness Week")}`,
  },
  {
    id: 22,
    title: "National Poison Prevention Week",
    description: "Campaign to highlight the dangers of poisoning from household products, medications, and environmental hazards.",
    date: "March 16-22, 2025",
    time: "All Week",
    location: "United States",
    organizer: "U.S. Department of Health & Human Services",
    attendees: 350,
    type: "safety",
    category: "observance",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("National Poison Prevention Week")}`,
  },
  {
    id: 23,
    title: "Invest Europe Investors' Forum",
    description: "Key forum for environmental, social, and governance focused investment strategies across Europe.",
    date: "March 19-20, 2025",
    time: "9:00 AM - 5:00 PM",
    location: "Geneva, Switzerland",
    organizer: "Invest Europe",
    attendees: 340,
    type: "esg",
    category: "conference",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Invest Europe Investors' Forum")}`,
  },
  {
    id: 24,
    title: "edie 25 Sustainability Conference",
    description: "Premier gathering for sustainability professionals focused on business transformation for environmental goals.",
    date: "March 26-27, 2025",
    time: "9:00 AM - 5:00 PM",
    location: "London, UK",
    organizer: "edie",
    attendees: 480,
    type: "esg",
    category: "conference",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("edie 25 Sustainability Conference")}`,
  },
  {
    id: 25,
    title: "Distracted Driving Awareness Month",
    description: "National campaign to recognize the dangers of and eliminate preventable deaths from distracted driving.",
    date: "April 1-30, 2025",
    time: "All Month",
    location: "United States",
    organizer: "National Safety Council",
    attendees: 680,
    type: "safety",
    category: "observance",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Distracted Driving Awareness Month")}`,
  },
  {
    id: 26,
    title: "National Workplace Violence Awareness Month",
    description: "Month dedicated to raising awareness about preventing violence in workplace settings.",
    date: "April 1-30, 2025",
    time: "All Month",
    location: "United States",
    organizer: "Occupational Safety and Health Administration",
    attendees: 390,
    type: "safety",
    category: "observance",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Workplace Violence Awareness Month")}`,
  },
  {
    id: 27,
    title: "Reuters Industrial Decarbonization Europe",
    description: "Conference focused on reducing carbon emissions in European industrial sectors.",
    date: "April 9-10, 2025",
    time: "9:00 AM - 5:00 PM",
    location: "Amsterdam, Netherlands",
    organizer: "Reuters Events",
    attendees: 410,
    type: "esg",
    category: "conference",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Industrial Decarbonization Europe")}`,
  },
  {
    id: 28,
    title: "Innovation Zero World Congress",
    description: "Global conference on climate innovation and zero-carbon technologies to drive emissions reduction.",
    date: "April 29-30, 2025",
    time: "9:00 AM - 6:00 PM",
    location: "London, UK",
    organizer: "Clean Tech Events Ltd",
    attendees: 560,
    type: "esg",
    category: "conference",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Innovation Zero World Congress")}`,
  },
  {
    id: 29,
    title: "National Electrical Safety Month",
    description: "Month promoting electrical safety awareness at home and in the workplace to prevent electrical fires, fatalities, and injuries.",
    date: "May 1-31, 2025",
    time: "All Month",
    location: "United States",
    organizer: "Electrical Safety Foundation International",
    attendees: 320,
    type: "safety",
    category: "observance",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("National Electrical Safety Month")}`,
  },
  {
    id: 30,
    title: "Mental Health Awareness Month",
    description: "Nationwide campaign to fight stigma, provide support, educate the public, and advocate for policies supporting mental health.",
    date: "May 1-31, 2025",
    time: "All Month",
    location: "United States",
    organizer: "Mental Health America",
    attendees: 750,
    type: "health",
    category: "observance",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Mental Health Awareness Month")}`,
  },
  {
    id: 31,
    title: "Circularity 25",
    description: "Premier gathering for accelerating the circular economy through innovative business models and design approaches.",
    date: "April 29 - May 1, 2025",
    time: "9:00 AM - 6:00 PM",
    location: "Denver, CO, USA",
    organizer: "GreenBiz Group",
    attendees: 540,
    type: "esg",
    category: "conference",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Circularity 25")}`,
  },
  {
    id: 32,
    title: "World Sustainability & ESG Summit",
    description: "Global gathering of sustainability and ESG professionals sharing best practices and innovations.",
    date: "May 13-14, 2025",
    time: "9:00 AM - 5:00 PM",
    location: "Amsterdam, Netherlands",
    organizer: "World Sustainability Foundation",
    attendees: 680,
    type: "esg",
    category: "conference",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("World Sustainability & ESG Summit")}`,
  },
  {
    id: 33,
    title: "National Heat Awareness Day",
    description: "Day dedicated to raising awareness about heat-related illness and injuries in the workplace.",
    date: "May 30, 2025",
    time: "All Day",
    location: "United States",
    organizer: "Occupational Safety and Health Administration",
    attendees: 280,
    type: "safety",
    category: "observance",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("National Heat Awareness Day")}`,
  },
  {
    id: 34,
    title: "National Conference on Responsible Business Conduct",
    description: "Conference focusing on escalating ESG for sustainable business development and corporate responsibility.",
    date: "September 4-5, 2025",
    time: "9:30 AM - 5:00 PM",
    location: "New Delhi, India",
    organizer: "National Safety Council of India",
    attendees: 490,
    type: "esg",
    category: "conference",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("National Conference on Responsible Business")}`,
  },
  {
    id: 35,
    title: "Climate Week NYC 2025",
    description: "Largest annual climate event bringing together hundreds of events and activities across New York City.",
    date: "September 21-28, 2025",
    time: "Various Times",
    location: "New York, USA",
    organizer: "The Climate Group",
    attendees: 950,
    type: "esg",
    category: "conference",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Climate Week NYC 2025")}`,
  },
  {
    id: 36,
    title: "UN COP 30 Climate Conference",
    description: "30th Conference of the Parties to the UN Framework Convention on Climate Change, a pivotal global climate summit.",
    date: "November 10-21, 2025",
    time: "All Day",
    location: "Belem, Brazil",
    organizer: "United Nations",
    attendees: 2500,
    type: "esg",
    category: "conference",
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("UN COP 30 Climate Conference")}`,
  }
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
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("Safety Leadership Roundtable")}`,
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
    image: `https://placehold.co/800x400/1f2937/f8fafc?text=${encodeURIComponent("ESG Metrics Working Group Session")}`,
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