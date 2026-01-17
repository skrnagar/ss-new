"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FileText,
  Briefcase,
  Building,
  BookOpen,
  MessageSquare,
  TrendingUp,
  Calendar,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Clock,
  Activity,
  Zap,
  BarChart3,
  Filter,
  Download,
  ArrowUpRight,
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart, 
  Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f97316', '#ec4899', '#6366f1', '#14b8a6', '#f59e0b'];

interface AnalyticsData {
  summary: {
    totalLikes: number;
    totalComments: number;
    totalPosts: number;
    totalConnections: number;
    totalMessages: number;
    engagementRate: number;
    avgLikesPerPost: number;
    avgCommentsPerPost: number;
  };
  dailyEngagement: Array<{ date: string; likes: number; comments: number; total: number }>;
  userActivity: Array<{ date: string; count: number }>;
  contentTrends: Array<{ date: string; posts: number; articles: number; jobs: number; events: number; total: number }>;
  hourlyActivity: Array<{ hour: string; count: number }>;
  topPosts: Array<{ id: string; content: string; likes: number; comments: number; engagement: number; created_at: string }>;
  topUsers: Array<{ id: string; full_name: string; username: string; avatar_url: string; created_at: string }>;
  topJobs: Array<any>;
  topArticles: Array<any>;
  topEvents: Array<any>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "365d">("30d");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-muted-foreground">Loading deep analytics...</span>
        </div>
      </div>
    );
  }

  const engagementMetrics = [
    {
      title: "Total Likes",
      value: analytics?.summary.totalLikes || 0,
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/50",
    },
    {
      title: "Total Comments",
      value: analytics?.summary.totalComments || 0,
      icon: MessageCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
    },
    {
      title: "Engagement Rate",
      value: `${analytics?.summary.engagementRate || 0}%`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/50",
    },
    {
      title: "Avg Likes/Post",
      value: (analytics?.summary.avgLikesPerPost || 0).toFixed(1),
      icon: Heart,
      color: "text-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-950/50",
    },
    {
      title: "Avg Comments/Post",
      value: (analytics?.summary.avgCommentsPerPost || 0).toFixed(1),
      icon: MessageCircle,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/50",
    },
    {
      title: "Total Connections",
      value: analytics?.summary.totalConnections || 0,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/50",
    },
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Deep Analytics
          </h1>
          <p className="text-muted-foreground">Comprehensive platform insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                {timeRange === "7d" ? "Last 7 days" : timeRange === "30d" ? "Last 30 days" : timeRange === "90d" ? "Last 90 days" : "Last year"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTimeRange("7d")}>Last 7 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("30d")}>Last 30 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("90d")}>Last 90 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("365d")}>Last year</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {engagementMetrics.map((metric) => (
          <Card key={metric.title} className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">{metric.title}</CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metric.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="engagement" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Daily Engagement Trends</CardTitle>
                <CardDescription>Likes and comments over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={analytics?.dailyEngagement || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-50" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem'
                      }} 
                    />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="total" fill="#3b82f6" fillOpacity={0.3} stroke="#3b82f6" strokeWidth={2} name="Total Engagement" />
                    <Bar yAxisId="right" dataKey="likes" fill="#ef4444" name="Likes" />
                    <Bar yAxisId="right" dataKey="comments" fill="#3b82f6" name="Comments" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Hourly Activity Pattern</CardTitle>
                <CardDescription>Platform activity by hour of day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={analytics?.hourlyActivity || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-50" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem'
                      }} 
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>User Growth & Activity</CardTitle>
              <CardDescription>New users and activity trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analytics?.userActivity || []}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-50" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }} 
                  />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Users */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Top Active Users</CardTitle>
              <CardDescription>Most recently registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.topUsers.slice(0, 5).map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>{user.full_name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.full_name || "Unknown"}</div>
                        <div className="text-sm text-muted-foreground">@{user.username}</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Content Creation Trends</CardTitle>
              <CardDescription>All content types over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={analytics?.contentTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-50" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }} 
                  />
                  <Legend />
                  <Area type="monotone" dataKey="total" fill="#8b5cf6" fillOpacity={0.3} stroke="#8b5cf6" strokeWidth={2} name="Total Content" />
                  <Bar dataKey="posts" fill="#10b981" name="Posts" />
                  <Bar dataKey="articles" fill="#f97316" name="Articles" />
                  <Bar dataKey="jobs" fill="#3b82f6" name="Jobs" />
                  <Bar dataKey="events" fill="#ec4899" name="Events" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Performing Content */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Top Performing Posts</CardTitle>
                <CardDescription>Highest engagement posts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.topPosts.map((post, index) => (
                    <div key={post.id} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">{post.content || "No content"}</p>
                        </div>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {post.likes}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {post.comments}
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {post.engagement} total
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Content Summary</CardTitle>
                <CardDescription>Quick content statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Total Posts</span>
                    </div>
                    <span className="text-2xl font-bold">{analytics?.summary.totalPosts || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-orange-600" />
                      <span className="font-medium">Articles</span>
                    </div>
                    <span className="text-2xl font-bold">{analytics?.topArticles.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Job Listings</span>
                    </div>
                    <span className="text-2xl font-bold">{analytics?.topJobs.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-pink-600" />
                      <span className="font-medium">Events</span>
                    </div>
                    <span className="text-2xl font-bold">{analytics?.topEvents.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Platform Activity Overview</CardTitle>
                <CardDescription>Daily activity metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={analytics?.dailyEngagement || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-50" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem'
                      }} 
                    />
                    <Legend />
                    <Line type="monotone" dataKey="likes" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Likes" />
                    <Line type="monotone" dataKey="comments" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Comments" />
                    <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Total" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Engagement Distribution</CardTitle>
                <CardDescription>Likes vs Comments ratio</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Likes", value: analytics?.summary.totalLikes || 0 },
                        { name: "Comments", value: analytics?.summary.totalComments || 0 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#ef4444" />
                      <Cell fill="#3b82f6" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Engagement Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {analytics?.summary.engagementRate || 0}%
                </div>
                <p className="text-sm text-muted-foreground">Overall platform engagement</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Average Likes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-red-600 mb-2">
                  {(analytics?.summary.avgLikesPerPost || 0).toFixed(1)}
                </div>
                <p className="text-sm text-muted-foreground">Per post average</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Average Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {(analytics?.summary.avgCommentsPerPost || 0).toFixed(1)}
                </div>
                <p className="text-sm text-muted-foreground">Per post average</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Performance Metrics Dashboard</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    <span>Total Likes</span>
                  </div>
                  <div className="text-2xl font-bold">{analytics?.summary.totalLikes.toLocaleString() || 0}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span>Total Comments</span>
                  </div>
                  <div className="text-2xl font-bold">{analytics?.summary.totalComments.toLocaleString() || 0}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Connections</span>
                  </div>
                  <div className="text-2xl font-bold">{analytics?.summary.totalConnections.toLocaleString() || 0}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span>Messages</span>
                  </div>
                  <div className="text-2xl font-bold">{analytics?.summary.totalMessages.toLocaleString() || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
