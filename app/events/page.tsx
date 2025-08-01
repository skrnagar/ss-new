"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  CalendarDays,
  Calendar as CalendarIcon,
  Clock,
  Filter,
  Grid,
  List,
  MapPin,
  Search,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EventsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    category: string;
    image?: string;
    type?: string;
  }

  const [eventsData, setEventsData] = useState<Event[]>([]);
  const [userEventsData, setUserEventsData] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Filtered events based on search and filters
  const getFilteredEvents = (events: any[]) => {
    return events.filter((event) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer?.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = categoryFilter === "" || event.category === categoryFilter;

      // Date filter
      let matchesDate = true;
      if (dateFilter !== "") {
        const eventDate = new Date(event.start_date);
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);

        if (dateFilter === "today") {
          matchesDate = eventDate.toDateString() === today.toDateString();
        } else if (dateFilter === "this-week") {
          matchesDate = eventDate >= today && eventDate <= nextWeek;
        } else if (dateFilter === "this-month") {
          matchesDate = eventDate >= today && eventDate <= nextMonth;
        }
      }

      return matchesSearch && matchesCategory && matchesDate;
    });
  };

  // Fetch events data from Supabase
  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);

        // Check if events table exists by attempting to select a single row
        const { error: tableCheckError } = await supabase.from("events").select("id").limit(1);

        // If table doesn't exist, use sample data instead
        if (tableCheckError) {
          console.log("Events table not found, using sample data");

          const sampleEvents = [
            {
              id: "1",
              title: "National Safety Day Conference",
              description:
                "Annual conference discussing workplace safety best practices and innovations.",
              start_date: "2025-03-04",
              date: "2025-03-04", // added
              location: "Virtual Event",
              image_url: "/placeholder.jpg",
              category: "Safety",
              is_public: true,
              profile: {
                id: "sample1",
                username: "safetyexpert",
                full_name: "Sarah Johnson",
                avatar_url: "",
              },
            },
            {
              id: "2",
              title: "World Health Day Forum",
              description: "Global discussion on health priorities and challenges.",
              start_date: "2025-04-07",
              date: "2025-04-07", // added
              location: "Geneva, Switzerland",
              image_url: "/placeholder.jpg",
              category: "Health",
              is_public: true,
              profile: {
                id: "sample2",
                username: "healthadvocate",
                full_name: "Michael Chen",
                avatar_url: "",
              },
            },
            {
              id: "3",
              title: "ESG Reporting Framework Summit",
              description: "Learn about the latest ESG reporting standards and requirements.",
              start_date: "2025-04-15",
              date: "2025-04-15", // added
              location: "London, UK",
              image_url: "/placeholder.jpg",
              category: "Environment",
              is_public: true,
              profile: {
                id: "sample3",
                username: "esgprofessional",
                full_name: "Emma Williams",
                avatar_url: "",
              },
            },
            {
              id: "4",
              title: "Biodiversity Summit",
              description: "Global conference on protecting biodiversity and natural habitats.",
              start_date: "2025-04-22",
              date: "2025-04-22", // added
              location: "New York, USA",
              image_url: "/placeholder.jpg",
              category: "Environment",
              is_public: true,
              profile: {
                id: "sample4",
                username: "ecologyadvisor",
                full_name: "James Peterson",
                avatar_url: "",
              },
            },
            {
              id: "5",
              title: "World Day for Safety and Health at Work",
              description: "Global awareness day for preventing workplace accidents and diseases.",
              start_date: "2025-04-28",
              date: "2025-04-28", // added
              location: "Multiple Locations",
              image_url: "/placeholder.jpg",
              category: "Safety",
              is_public: true,
              profile: {
                id: "sample5",
                username: "safetyadvocate",
                full_name: "Anna Martinez",
                avatar_url: "",
              },
            },
          ];

          setEventsData(sampleEvents);
          // For logged-in users, you might want to assign some sample events to them as well
          setUserEventsData([]);
          return;
        }

        // If table exists, proceed with real data fetching
        try {
          // Fetch public events - first try with profile join
          const { data: publicEvents, error: publicError } = await supabase
            .from("events")
            .select("*")
            .eq("is_public", true)
            .order("start_date", { ascending: true });

          if (publicError) throw publicError;

          // For each event, fetch the profile data separately
          const eventsWithProfiles = await Promise.all(
            (publicEvents || []).map(async (event) => {
              try {
                // Get profile data for this event
                const { data: profileData } = await supabase
                  .from("profiles")
                  .select("id, username, full_name, avatar_url")
                  .eq("id", event.user_id)
                  .single();

                return {
                  ...event,
                  profile: profileData || {
                    id: event.user_id,
                    username: "anonymous",
                    full_name: "Anonymous User",
                    avatar_url: "",
                  },
                };
              } catch (err) {
                console.log(`Error fetching profile for event ${event.id}:`, err);
                // Return event with default profile
                return {
                  ...event,
                  profile: {
                    id: event.user_id,
                    username: "anonymous",
                    full_name: "Anonymous User",
                    avatar_url: "",
                  },
                };
              }
            })
          );

          setEventsData(eventsWithProfiles);

          // Fetch user-specific events (if user is logged in)
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user?.id) {
            const { data: userEvents, error: userError } = await supabase
              .from("events")
              .select("*")
              .eq("user_id", session.user.id)
              .order("start_date", { ascending: true });

            if (userError) throw userError;

            // For each user event, fetch the profile data separately
            const userEventsWithProfiles = await Promise.all(
              (userEvents || []).map(async (event) => {
                try {
                  // Get profile data for this event
                  const { data: profileData } = await supabase
                    .from("profiles")
                    .select("id, username, full_name, avatar_url")
                    .eq("id", event.user_id)
                    .single();

                  return {
                    ...event,
                    profile: profileData || {
                      id: event.user_id,
                      username: "anonymous",
                      full_name: "Anonymous User",
                      avatar_url: "",
                    },
                  };
                } catch (err) {
                  console.log(`Error fetching profile for user event ${event.id}:`, err);
                  // Return event with default profile
                  return {
                    ...event,
                    profile: {
                      id: event.user_id,
                      username: session.user.email?.split("@")[0] || "user",
                      full_name: "You",
                      avatar_url: "",
                    },
                  };
                }
              })
            );

            setUserEventsData(userEventsWithProfiles);
          }
        } catch (queryError) {
          console.error("Error querying events with profiles:", queryError);
          setEventsData([]);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const filteredEvents = getFilteredEvents(eventsData);
  const filteredUserEvents = getFilteredEvents(userEventsData);

  // Function to render event cards
  const renderEventCard = (event: any) => (
    <Card className="overflow-hidden" key={event.id}>
      <div className="h-48 overflow-hidden relative">
        <img
          src={event.image_url || "/placeholder.jpg"}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge className="bg-primary">{event.category}</Badge>
        </div>
      </div>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg">{event.title}</CardTitle>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-1">
          <CalendarDays className="mr-1 h-4 w-4" />
          <span>
            {format(new Date(event.start_date), "MMM d, yyyy")}
            {event.end_date &&
              event.end_date !== event.start_date &&
              ` - ${format(new Date(event.end_date), "MMM d, yyyy")}`}
          </span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-1 h-4 w-4" />
          <span>{event.start_time || "TBA"}</span>
        </div>
        {event.location && (
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <MapPin className="mr-1 h-4 w-4" />
            <span>{event.location}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={event.profile?.avatar_url || ""} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{event.profile?.full_name || "Anonymous"}</span>
        </div>
        <Button size="sm" variant="outline" onClick={() => router.push(`/events/${event.id}`)}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );

  // Function to render event list items
  const renderEventListItem = (event: any) => (
    <Card className="mb-3" key={event.id}>
      <CardContent className="p-4 flex gap-4">
        <div className="min-w-24 flex-shrink-0">
          <div className="rounded-md overflow-hidden h-24 w-24">
            <img
              src={event.image_url || "/placeholder.jpg"}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold">{event.title}</h3>
            <Badge className="bg-primary">{event.category}</Badge>
          </div>
          <div className="flex items-center text-sm text-muted-foreground mb-1">
            <CalendarDays className="mr-1 h-4 w-4" />
            <span>
              {format(new Date(event.start_date), "MMM d, yyyy")}
              {event.end_date &&
                event.end_date !== event.start_date &&
                ` - ${format(new Date(event.end_date), "MMM d, yyyy")}`}
            </span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            <span>{event.start_time || "TBA"}</span>
            {event.location && (
              <>
                <MapPin className="ml-2 mr-1 h-4 w-4" />
                <span>{event.location}</span>
              </>
            )}
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={event.profile?.avatar_url || ""} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{event.profile?.full_name || "Anonymous"}</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => router.push(`/events/${event.id}`)}>
              Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">Discover upcoming ESG and EHS events</p>
        </div>
        <Button onClick={() => router.push("/events/create")}>Create Event</Button>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="my-events">My Events</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
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
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="flex-grow">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <span>{categoryFilter || "Category"}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Environment">Environment</SelectItem>
                  <SelectItem value="Safety">Safety</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Social">Social</SelectItem>
                  <SelectItem value="Governance">Governance</SelectItem>
                  <SelectItem value="Conference">Conference</SelectItem>
                  <SelectItem value="Webinar">Webinar</SelectItem>
                  <SelectItem value="Workshop">Workshop</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-shrink-0">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? dateFilter.replace("-", " ") : "Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-3">
                    <div className="space-y-2">
                      <Button
                        variant={dateFilter === "today" ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setDateFilter(dateFilter === "today" ? "" : "today")}
                      >
                        Today
                      </Button>
                      <Button
                        variant={dateFilter === "this-week" ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setDateFilter(dateFilter === "this-week" ? "" : "this-week")}
                      >
                        This Week
                      </Button>
                      <Button
                        variant={dateFilter === "this-month" ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() =>
                          setDateFilter(dateFilter === "this-month" ? "" : "this-month")
                        }
                      >
                        This Month
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setDateFilter("")}
                      >
                        Clear Filter
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "ghost" : "outline"}
                  size="icon"
                  className="rounded-r-none"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "ghost" : "outline"}
                  size="icon"
                  className="rounded-l-none"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <Card className="overflow-hidden" key={i}>
                    <div className="h-48 bg-muted animate-pulse" />
                    <CardHeader className="p-4">
                      <div className="h-5 bg-muted rounded animate-pulse mb-2" />
                      <div className="h-4 bg-muted rounded animate-pulse w-3/4 mb-1" />
                      <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="h-4 bg-muted rounded animate-pulse mb-1" />
                      <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <div className="h-8 bg-muted rounded animate-pulse w-1/3" />
                      <div className="h-8 bg-muted rounded animate-pulse w-1/4" />
                    </CardFooter>
                  </Card>
                ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map(renderEventCard)}
              </div>
            ) : (
              <div className="space-y-3">{filteredEvents.map(renderEventListItem)}</div>
            )
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-lg font-medium">No events found</p>
                <p className="text-muted-foreground mt-1">Try adjusting your search or filters</p>
                <Button className="mt-4" onClick={() => router.push("/events/create")}>
                  Create an Event
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my-events">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card className="overflow-hidden" key={i}>
                    <div className="h-48 bg-muted animate-pulse" />
                    <CardHeader className="p-4">
                      <div className="h-5 bg-muted rounded animate-pulse mb-2" />
                      <div className="h-4 bg-muted rounded animate-pulse w-3/4 mb-1" />
                      <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="h-4 bg-muted rounded animate-pulse mb-1" />
                      <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <div className="h-8 bg-muted rounded animate-pulse w-1/3" />
                      <div className="h-8 bg-muted rounded animate-pulse w-1/4" />
                    </CardFooter>
                  </Card>
                ))}
            </div>
          ) : filteredUserEvents.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUserEvents.map(renderEventCard)}
              </div>
            ) : (
              <div className="space-y-3">{filteredUserEvents.map(renderEventListItem)}</div>
            )
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-lg font-medium">You haven't created any events yet</p>
                <p className="text-muted-foreground mt-1">Create your first event to see it here</p>
                <Button className="mt-4" onClick={() => router.push("/events/create")}>
                  Create an Event
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Event Calendar</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Today
                </Button>
                <Button variant="outline" size="sm">
                  Month
                </Button>
                <Button variant="outline" size="sm">
                  Week
                </Button>
                <Button variant="outline" size="sm">
                  Day
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-7 gap-1">
                  {/* Calendar header - Days of the week */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center py-2 font-medium text-sm">
                      {day}
                    </div>
                  ))}

                  {/* Calendar grid - example for a month */}
                  {Array.from({ length: 35 }).map((_, i) => {
                    const day = i - 2; // Adjust to start from correct day (example)
                    return (
                      <div
                        key={i}
                        className={`min-h-24 border rounded-md p-1 ${day < 1 || day > 30 ? "bg-muted/30" : ""}`}
                      >
                        {day > 0 && day <= 30 && (
                          <>
                            <div className="text-right text-sm mb-1">{day}</div>
                            {/* Example events - dynamically this would come from the real data */}
                            {day === 4 && (
                              <div className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-xs p-1 rounded mb-1 truncate">
                                National Safety Day
                              </div>
                            )}
                            {day === 7 && (
                              <div className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs p-1 rounded mb-1 truncate">
                                World Health Day
                              </div>
                            )}
                            {day === 15 && (
                              <div className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 text-xs p-1 rounded mb-1 truncate">
                                ESG Reporting Summit
                              </div>
                            )}
                            {day === 22 && (
                              <div className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 text-xs p-1 rounded mb-1 truncate">
                                Biodiversity Summit
                              </div>
                            )}
                            {day === 28 && (
                              <div className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 text-xs p-1 rounded mb-1 truncate">
                                Safety & Health at Work
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Example upcoming events */}
                {[
                  {
                    title: "National Safety Day Conference",
                    date: "March 4, 2025",
                    type: "safety",
                  },
                  {
                    title: "World Health Day",
                    date: "April 7, 2025",
                    type: "health",
                  },
                  {
                    title: "ESG Reporting Framework Summit",
                    date: "April 15, 2025",
                    type: "esg",
                  },
                  {
                    title: "World Day for Safety and Health at Work",
                    date: "April 28, 2025",
                    type: "safety",
                  },
                  {
                    title: "Mental Health Awareness Month",
                    date: "May 1-31, 2025",
                    type: "health",
                  },
                ].map((event, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div
                      className={`w-3 h-3 mt-1 rounded-full flex-shrink-0 ${
                        event.type === "safety"
                          ? "bg-red-500"
                          : event.type === "esg"
                            ? "bg-green-500"
                            : "bg-blue-500"
                      }`}
                    />
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
