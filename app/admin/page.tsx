"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FileText,
  Briefcase,
  Building,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Activity,
  MessageSquare,
  Shield,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  Eye,
  Plus,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { useAdmin } from "@/contexts/admin-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalJobs: number;
  totalCompanies: number;
  totalArticles: number;
  totalMessages: number;
  totalEvents: number;
  recentActivity: any[];
  userGrowth: any[];
  postActivity: any[];
  userGrowthPercentage: number;
  postGrowthPercentage: number;
  activeUsersToday: number;
  pendingApprovals?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");
  const { admin } = useAdmin();
  const isSuperAdmin = admin?.role === "super_admin";

  useEffect(() => {
    fetchDashboardStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchDashboardStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`/api/admin/stats?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-muted-foreground">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      description: "Registered users",
      trend: stats?.userGrowthPercentage || 0,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      link: "/admin/users",
      chartColor: "#3b82f6",
    },
    {
      title: "Total Posts",
      value: stats?.totalPosts || 0,
      icon: FileText,
      description: "User posts",
      trend: stats?.postGrowthPercentage || 0,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
      link: "/admin/posts",
      chartColor: "#10b981",
    },
    {
      title: "Total Jobs",
      value: stats?.totalJobs || 0,
      icon: Briefcase,
      description: "Job listings",
      trend: 0,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      link: "/admin/jobs",
      chartColor: "#8b5cf6",
    },
    {
      title: "Total Companies",
      value: stats?.totalCompanies || 0,
      icon: Building,
      description: "Company pages",
      trend: 0,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      link: "/admin/companies",
      chartColor: "#f97316",
    },
    {
      title: "Total Articles",
      value: stats?.totalArticles || 0,
      icon: BookOpen,
      description: "Knowledge articles",
      trend: 0,
      color: "text-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-950",
      link: "/admin/articles",
      chartColor: "#ec4899",
    },
    {
      title: "Total Messages",
      value: stats?.totalMessages || 0,
      icon: MessageSquare,
      description: "User messages",
      trend: 0,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950",
      link: "/admin/messages",
      chartColor: "#6366f1",
    },
  ];

  const contentDistribution = [
    { name: "Posts", value: stats?.totalPosts || 0 },
    { name: "Articles", value: stats?.totalArticles || 0 },
    { name: "Jobs", value: stats?.totalJobs || 0 },
    { name: "Companies", value: stats?.totalCompanies || 0 },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {admin?.full_name || "Admin"}! Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {timeRange === "7d" ? "Last 7 days" : timeRange === "30d" ? "Last 30 days" : "Last 90 days"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setTimeRange("7d")}>Last 7 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("30d")}>Last 30 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("90d")}>Last 90 days</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {isSuperAdmin && (
            <Badge variant="default" className="gap-2 px-3 py-1">
              <Shield className="h-3.5 w-3.5" />
              Super Admin
            </Badge>
          )}
        </div>
      </div>

      {isSuperAdmin && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900 dark:text-blue-100">
            You have super admin privileges. You can manage admin users and approve new admin accounts.
            <Button variant="link" asChild className="ml-2 p-0 h-auto text-blue-600">
              <Link href="/admin/admin-users">Manage Admin Users →</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const isPositive = stat.trend >= 0;
          return (
            <Card key={stat.title} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bgColor} rounded-full -mr-16 -mt-16 opacity-50`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
                  {stat.trend !== 0 && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                      {isPositive ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {Math.abs(stat.trend).toFixed(1)}%
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-3">{stat.description}</p>
                {stat.link && (
                  <Button variant="ghost" size="sm" asChild className="h-8 text-xs">
                    <Link href={stat.link}>
                      View all <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
          <Link href="/admin/posts/create">
            <Plus className="h-5 w-5" />
            <span>New Post</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
          <Link href="/articles/create">
            <Plus className="h-5 w-5" />
            <span>New Article</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
          <Link href="/jobs/post">
            <Plus className="h-5 w-5" />
            <span>New Job</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
          <Link href="/companies/create">
            <Plus className="h-5 w-5" />
            <span>New Company</span>
          </Link>
        </Button>
      </div>

      {/* Enhanced Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>User Growth Trend</CardTitle>
              <CardDescription>New users over time</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/analytics">
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats?.userGrowth || []}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fill="url(#colorUsers)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Post Activity</CardTitle>
              <CardDescription>Posts created over time</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/posts">
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.postActivity || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }} 
                />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Content Distribution & Recent Activity */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Content Distribution</CardTitle>
            <CardDescription>Breakdown by type</CardDescription>
          </CardHeader>
          <CardContent>
            {contentDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={contentDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {contentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform activities</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/activity">
                View all <ArrowUpRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.slice(0, 5).map((activity: any, index: number) => (
                  <div key={index} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                    <div className="p-2 rounded-full bg-muted">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.action || "Activity"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {activity.admin_user && (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs">
                                {activity.admin_user.full_name?.[0] || "A"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {activity.admin_user.full_name || "Admin"}
                            </span>
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {activity.created_at ? new Date(activity.created_at).toLocaleString() : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Activity className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
