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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  UserPlus, 
  Eye,
  FileText,
  MessageCircle,
  Heart,
  Users,
  MessageSquare,
  Briefcase,
  BookOpen,
  Calendar,
  Building,
  TrendingUp,
  Mail,
  MapPin,
  Briefcase as BriefcaseIcon,
  Clock,
  Activity,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface User {
  id: string;
  username: string;
  full_name: string;
  email: string;
  avatar_url: string;
  headline: string;
  company: string;
  position: string;
  location: string;
  bio: string;
  created_at: string;
}

interface UserDetails {
  profile: User;
  stats: {
    posts: number;
    comments: number;
    likes: number;
    connections: number;
    messages: number;
    jobApplications: number;
    articles: number;
    events: number;
    following: number;
    followers: number;
    totalEngagement: number;
    engagementRate: number;
  };
  activity: {
    posts: any[];
    comments: any[];
    likes: any[];
    connections: any[];
    messages: any[];
    jobApplications: any[];
    articles: any[];
    events: any[];
    follows: any[];
    companyFollowers: any[];
  };
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/regular-users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setFilteredUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    setLoadingDetails(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserDetails(data);
      } else {
        throw new Error("Failed to fetch user details");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch user details",
        variant: "destructive",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailDialogOpen(true);
    fetchUserDetails(user.id);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: data.message || "User and all related data deleted successfully",
        });
        fetchUsers();
        setIsDeleteDialogOpen(false);
        setSelectedUser(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.details || errorData.error || "Failed to delete user";
        
        toast({
          title: errorData.code === "FOREIGN_KEY_CONSTRAINT" ? "Cannot Delete User" : "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string): string => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part?.[0] || "")
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-muted-foreground">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage all platform users</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or username..."
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
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_url || ""} alt={user.full_name || ""} />
                            <AvatarFallback>{getInitials(user.full_name || "")}</AvatarFallback>
                          </Avatar>
                          <div>
                            <button
                              onClick={() => handleViewDetails(user)}
                              className="font-medium hover:text-primary hover:underline cursor-pointer text-left"
                            >
                              {user.full_name || "N/A"}
                            </button>
                            <div className="text-sm text-muted-foreground">@{user.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email || "N/A"}</TableCell>
                      <TableCell>
                        {user.company ? (
                          <Badge variant="outline">{user.company}</Badge>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{user.position || "N/A"}</TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleViewDetails(user)}
                            title="View user details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDeleteDialogOpen(true);
                            }}
                            title="Delete user"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
            <DialogTitle className="text-xl sm:text-2xl">User Details</DialogTitle>
            <DialogDescription className="text-sm">
              Complete information about {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center h-64 flex-1">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-muted-foreground">Loading user details...</span>
              </div>
            </div>
          ) : userDetails ? (
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 min-h-0">
              <div className="space-y-4 sm:space-y-6">
                {/* Profile Section */}
                <Card className="border-2">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                          <AvatarImage src={userDetails.profile.avatar_url} />
                          <AvatarFallback className="text-xl sm:text-2xl">
                            {getInitials(userDetails.profile.full_name || "")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold">{userDetails.profile.full_name || "Unknown"}</h3>
                          <p className="text-sm sm:text-base text-muted-foreground">@{userDetails.profile.username}</p>
                          {userDetails.profile.headline && (
                            <p className="mt-1 text-sm sm:text-base">{userDetails.profile.headline}</p>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" asChild size="sm" className="w-full sm:w-auto">
                        <Link href={`/profile/${userDetails.profile.username}`} target="_blank">
                          View Profile <Eye className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Email:</span>
                          <span>{userDetails.profile.email || "N/A"}</span>
                        </div>
                        {userDetails.profile.company && (
                          <div className="flex items-center gap-2 text-sm">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Company:</span>
                            <Badge variant="outline">{userDetails.profile.company}</Badge>
                          </div>
                        )}
                        {userDetails.profile.position && (
                          <div className="flex items-center gap-2 text-sm">
                            <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Position:</span>
                            <span>{userDetails.profile.position}</span>
                          </div>
                        )}
                        {userDetails.profile.location && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Location:</span>
                            <span>{userDetails.profile.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Joined:</span>
                          <span>{new Date(userDetails.profile.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      {userDetails.profile.bio && (
                        <div className="space-y-2">
                          <span className="text-sm font-medium">Bio:</span>
                          <p className="text-sm text-muted-foreground">{userDetails.profile.bio}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                  <Card className="border-2">
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-xs font-medium text-muted-foreground">Posts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl font-bold">{userDetails.stats.posts}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-2">
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-xs font-medium text-muted-foreground">Comments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl font-bold">{userDetails.stats.comments}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-2">
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-xs font-medium text-muted-foreground">Likes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl font-bold">{userDetails.stats.likes}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-2">
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-xs font-medium text-muted-foreground">Following</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl font-bold">{userDetails.stats.following}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-2 col-span-2 sm:col-span-1">
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-xs font-medium text-muted-foreground">Followers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl font-bold">{userDetails.stats.followers}</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs font-medium text-muted-foreground">Connections</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userDetails.stats.connections}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs font-medium text-muted-foreground">Messages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userDetails.stats.messages}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs font-medium text-muted-foreground">Job Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userDetails.stats.jobApplications}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs font-medium text-muted-foreground">Engagement Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userDetails.stats.engagementRate}%</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Activity Tabs */}
                <Tabs defaultValue="posts" className="w-full">
                  <div className="overflow-x-auto">
                    <TabsList className="inline-flex w-full sm:grid sm:grid-cols-5 min-w-max sm:min-w-0">
                      <TabsTrigger value="posts" className="text-xs sm:text-sm whitespace-nowrap">Posts ({userDetails.activity.posts.length})</TabsTrigger>
                      <TabsTrigger value="comments" className="text-xs sm:text-sm whitespace-nowrap">Comments ({userDetails.activity.comments.length})</TabsTrigger>
                      <TabsTrigger value="likes" className="text-xs sm:text-sm whitespace-nowrap">Likes ({userDetails.activity.likes.length})</TabsTrigger>
                      <TabsTrigger value="content" className="text-xs sm:text-sm whitespace-nowrap">Content</TabsTrigger>
                      <TabsTrigger value="activity" className="text-xs sm:text-sm whitespace-nowrap">Activity</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="posts" className="space-y-2">
                    {userDetails.activity.posts.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">No posts found</p>
                    ) : (
                      userDetails.activity.posts.map((post) => (
                        <Card key={post.id} className="border">
                          <CardContent className="pt-4">
                            <p className="text-sm mb-2 line-clamp-2">{post.content || "No content"}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{post.likes_count || 0} likes</span>
                              <span>{post.comments_count || 0} comments</span>
                              <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="comments" className="space-y-2">
                    {userDetails.activity.comments.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">No comments found</p>
                    ) : (
                      userDetails.activity.comments.map((comment) => (
                        <Card key={comment.id} className="border">
                          <CardContent className="pt-4">
                            <p className="text-sm">{comment.content}</p>
                            <span className="text-xs text-muted-foreground mt-2 block">
                              {new Date(comment.created_at).toLocaleString()}
                            </span>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="likes" className="space-y-2">
                    {userDetails.activity.likes.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">No likes found</p>
                    ) : (
                      userDetails.activity.likes.map((like) => (
                        <Card key={like.id} className="border">
                          <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Heart className="h-4 w-4 text-red-500" />
                              <span>Liked post</span>
                              <span className="text-xs text-muted-foreground ml-auto">
                                {new Date(like.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="content" className="space-y-4">
                    <div className="space-y-4">
                      <Card className="border">
                        <CardHeader>
                          <CardTitle className="text-lg">Articles ({userDetails.activity.articles.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {userDetails.activity.articles.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No articles found</p>
                          ) : (
                            <div className="space-y-2">
                              {userDetails.activity.articles.map((article) => (
                                <div key={article.id} className="flex items-center justify-between p-2 rounded-lg border">
                                  <span className="text-sm font-medium">{article.title}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(article.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="border">
                        <CardHeader>
                          <CardTitle className="text-lg">Events ({userDetails.activity.events.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {userDetails.activity.events.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No events found</p>
                          ) : (
                            <div className="space-y-2">
                              {userDetails.activity.events.map((event) => (
                                <div key={event.id} className="flex items-center justify-between p-2 rounded-lg border">
                                  <span className="text-sm font-medium">{event.title}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(event.start_date || event.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="border">
                        <CardHeader>
                          <CardTitle className="text-lg">Job Applications ({userDetails.activity.jobApplications.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {userDetails.activity.jobApplications.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No job applications found</p>
                          ) : (
                            <div className="space-y-2">
                              {userDetails.activity.jobApplications.map((app) => (
                                <div key={app.id} className="flex items-center justify-between p-2 rounded-lg border">
                                  <Badge variant={app.status === "accepted" ? "default" : app.status === "rejected" ? "destructive" : "outline"}>
                                    {app.status}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(app.applied_at).toLocaleDateString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="activity" className="space-y-4">
                    <Card className="border">
                      <CardHeader>
                        <CardTitle className="text-lg">Connections ({userDetails.stats.connections})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          User has {userDetails.stats.connections} connections in their network.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border">
                      <CardHeader>
                        <CardTitle className="text-lg">Messages ({userDetails.stats.messages})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          User has sent/received {userDetails.stats.messages} messages.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border">
                      <CardHeader>
                        <CardTitle className="text-lg">Companies Following ({userDetails.activity.companyFollowers.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          User is following {userDetails.activity.companyFollowers.length} companies.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          ) : null}

          <DialogFooter className="px-6 py-4 border-t flex-shrink-0 flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)} className="w-full sm:w-auto">
              Close
            </Button>
            <Button variant="destructive" onClick={() => {
              setIsDetailDialogOpen(false);
              setSelectedUser(userDetails?.profile || null);
              setIsDeleteDialogOpen(true);
            }} className="w-full sm:w-auto">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.full_name || selectedUser?.email}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
