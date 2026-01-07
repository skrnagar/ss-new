"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ActivityLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: any;
  ip_address: string;
  created_at: string;
  admin_user: {
    full_name: string;
    email: string;
  };
}

export default function ActivityLogPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = activities.filter(
        (activity) =>
          activity.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.admin_user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.resource_type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredActivities(filtered);
    } else {
      setFilteredActivities(activities);
    }
  }, [searchQuery, activities]);

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/admin/activity");
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
        setFilteredActivities(data.activities || []);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("delete")) return "destructive";
    if (action.includes("create") || action.includes("add")) return "default";
    if (action.includes("update") || action.includes("edit")) return "secondary";
    return "outline";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-muted-foreground">Loading activity log...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground">View all admin activities</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Activities</CardTitle>
          <CardDescription>Track all actions performed by admins</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities by action, admin, or resource..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No activities found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {activity.admin_user?.full_name || "Unknown"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {activity.admin_user?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionColor(activity.action)}>{activity.action}</Badge>
                      </TableCell>
                      <TableCell>
                        {activity.resource_type && (
                          <div>
                            <div className="font-medium capitalize">{activity.resource_type}</div>
                            {activity.resource_id && (
                              <div className="text-sm text-muted-foreground">
                                ID: {activity.resource_id.substring(0, 8)}...
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{activity.ip_address}</TableCell>
                      <TableCell>
                        {new Date(activity.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

