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
  Clock,
  Zap,
  TrendingUp as TrendingUpIcon,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend } from "recharts";
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
import { Separator } from "@/components/ui/separator";

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

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f97316', '#ec4899', '#6366f1'];

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
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
      borderColor: "border-blue-200 dark:border-blue-900",
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
      bgColor: "bg-green-50 dark:bg-green-950/50",
      borderColor: "border-green-200 dark:border-green-900",
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
      bgColor: "bg-purple-50 dark:bg-purple-950/50",
      borderColor: "border-purple-200 dark:border-purple-900",
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
      bgColor: "bg-orange-50 dark:bg-orange-950/50",
      borderColor: "border-orange-200 dark:border-orange-900",
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
      bgColor: "bg-pink-50 dark:bg-pink-950/50",
      borderColor: "border-pink-200 dark:border-pink-900",
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
      bgColor: "bg-indigo-50 dark:bg-indigo-950/50",
      borderColor: "border-indigo-200 dark:border-indigo-900",
      link: "/admin/messages",
      chartColor: "#6366f1",
    },
  ];

  const contentDistribution = [
    { name: "Posts", value: stats?.totalPosts || 0, color: COLORS[0] },
    { name: "Articles", value: stats?.totalArticles || 0, color: COLORS[1] },
    { name: "Jobs", value: stats?.totalJobs || 0, color: COLORS[2] },
    { name: "Companies", value: stats?.totalCompanies || 0, color: COLORS[3] },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6 pb-6">
      {/* Header Section with Better Spacing */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, <span className="font-medium text-foreground">{admin?.full_name || "Admin"}</span>! Here's your platform overview.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  {timeRange === "7d" ? "Last 7 days" : timeRange === "30d" ? "Last 30 days" : "Last 90 days"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTimeRange("7d")}>Last 7 days</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange("30d")}>Last 30 days</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange("90d")}>Last 90 days</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            {isSuperAdmin && (
              <Badge variant="default" className="gap-2 px-3 py-1.5">
                <Shield className="h-3.5 w-3.5" />
                Super Admin
              </Badge>
            )}
          </div>
      </div>

        {/* System Health Indicators */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">System Status</span>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-300">
                  Operational
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Active Today</span>
                </div>
                <span className="text-lg font-bold">{stats?.activeUsersToday || 0}</span>
              </div>
            </CardContent>
          </Card>
          {isSuperAdmin && stats?.pendingApprovals !== undefined && stats.pendingApprovals > 0 && (
            <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <span className="text-sm font-medium">Pending Approvals</span>
                  </div>
                  <Badge variant="destructive">{stats.pendingApprovals}</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {isSuperAdmin && (
        <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/20">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900 dark:text-blue-100">
            You have super admin privileges. You can manage admin users and approve new admin accounts.
            <Button variant="link" asChild className="ml-2 p-0 h-auto text-blue-600 hover:text-blue-700">
              <Link href="/admin/admin-users">Manage Admin Users →</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced Stats Grid with Better Visual Design */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const isPositive = stat.trend >= 0;
          return (
            <Card 
              key={stat.title} 
              className={`relative overflow-hidden border-2 ${stat.borderColor} hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group`}
            >
              {/* Decorative gradient background */}
              <div className={`absolute top-0 right-0 w-40 h-40 ${stat.bgColor} rounded-full -mr-20 -mt-20 opacity-40 group-hover:opacity-60 transition-opacity`} />
              
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2.5 rounded-xl ${stat.bgColor} shadow-sm group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div className="text-4xl font-bold tracking-tight">{stat.value.toLocaleString()}</div>
                  {stat.trend !== 0 && (
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${
                      isPositive 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      {isPositive ? (
                        <TrendingUpIcon className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                      )}
                      {Math.abs(stat.trend).toFixed(1)}%
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                  {stat.link && (
                    <Button variant="ghost" size="sm" asChild className="h-7 text-xs gap-1">
                      <Link href={stat.link}>
                        View all <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="space-y-0.5">
              <CardTitle className="text-lg">User Growth Trend</CardTitle>
              <CardDescription className="text-xs">New users over time</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
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
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-50" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={2.5}
                  fill="url(#colorUsers)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="space-y-0.5">
              <CardTitle className="text-lg">Post Activity</CardTitle>
              <CardDescription className="text-xs">Posts created over time</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
              <Link href="/admin/posts">
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.postActivity || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-50" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Content Distribution & Recent Activity - Enhanced Layout */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1 border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Content Distribution</CardTitle>
            <CardDescription className="text-xs">Breakdown by type</CardDescription>
        </CardHeader>
        <CardContent>
            {contentDistribution.length > 0 ? (
          <div className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={contentDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={65}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {contentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 pt-2">
                  {contentDistribution.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-muted-foreground">{item.value}</span>
                  </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
                <FileText className="h-12 w-12 mb-2 opacity-30" />
                <p className="text-sm">No content data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="space-y-0.5">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription className="text-xs">Latest platform activities</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="h-8 text-xs gap-1">
              <Link href="/admin/activity">
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.slice(0, 6).map((activity: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium leading-snug">{activity.action || "Activity"}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {activity.admin_user && (
                          <div className="flex items-center gap-1.5">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[10px] bg-muted">
                                {activity.admin_user.full_name?.[0] || "A"}
                              </AvatarFallback>
                            </Avatar>
                            <span>{activity.admin_user.full_name || "Admin"}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.created_at ? new Date(activity.created_at).toLocaleDateString() : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Activity className="h-16 w-16 text-muted-foreground mb-3 opacity-20" />
                  <p className="text-sm font-medium text-muted-foreground mb-1">No recent activity</p>
                  <p className="text-xs text-muted-foreground">Activity will appear here as actions are performed</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
