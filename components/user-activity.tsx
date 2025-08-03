"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Clock, 
  Globe, 
  MoreHorizontal,
  Heart,
  Share2,
  Send,
  FileText,
  ImageIcon,
  Calendar,
  MapPin,
  Building,
  Bookmark,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { InlineLoader } from "@/components/ui/logo-loder";
import dynamic from "next/dynamic";

// Import PostItem component dynamically like in feed page
const PostItem = dynamic(() => import("@/components/post-item").then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3 mb-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-3 w-[160px]" />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-[200px] w-full rounded-md" />
      </CardContent>
    </Card>
  ),
});

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  updated_at?: string;
  profile?: any;
}

interface Activity {
  id: string;
  type: "comment" | "like";
  created_at: string;
  data: {
    content?: string;
    post_id: string;
    post_content?: string;
    post_author?: string;
  };
}

interface UserActivityProps {
  userId: string;
  isOwnProfile: boolean;
  currentUser?: any;
}

export function UserActivity({ userId, isOwnProfile, currentUser }: UserActivityProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchData();
    
    // Set up real-time subscription for posts
    const postsSubscription = supabase
      .channel('posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Post change detected:', payload);
          // Refresh data when posts change
          fetchData();
        }
      )
      .subscribe();

    // Set up real-time subscription for likes
    const likesSubscription = supabase
      .channel('likes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes'
        },
        (payload) => {
          console.log('Like change detected:', payload);
          // Refresh data when likes change
          fetchData();
        }
      )
      .subscribe();

    // Set up real-time subscription for comments
    const commentsSubscription = supabase
      .channel('comments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments'
        },
        (payload) => {
          console.log('Comment change detected:', payload);
          // Refresh data when comments change
          fetchData();
        }
      )
      .subscribe();

    return () => {
      postsSubscription.unsubscribe();
      likesSubscription.unsubscribe();
      commentsSubscription.unsubscribe();
    };
  }, [userId]);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      // Fetch posts with the same structure as feed page
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("*, profile:profiles(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(15);

      if (postsError) {
        console.error("Error fetching posts:", postsError);
      }

      // Fetch user's recent likes and comments as activities
      const [likesResult, commentsResult] = await Promise.all([
        supabase
          .from("likes")
          .select("id, created_at, post_id")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("comments")
          .select("id, content, created_at, post_id")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10)
      ]);

      // Get post details for activities
      const postIds = [
        ...(likesResult.data || []).map(like => like.post_id),
        ...(commentsResult.data || []).map(comment => comment.post_id)
      ];

      let postDetails: any[] = [];
      if (postIds.length > 0) {
        const { data: posts } = await supabase
          .from("posts")
          .select("id, content, profiles!user_id(full_name)")
          .in("id", postIds);
        postDetails = posts || [];
      }

      // Transform likes and comments into activities
      const activitiesData = [
        ...(likesResult.data || []).map(like => {
          const post = postDetails.find(p => p.id === like.post_id);
          return {
            id: like.id,
            type: "like" as const,
            created_at: like.created_at,
            data: {
              post_id: like.post_id,
              post_content: post?.content || "",
              post_author: post?.profiles?.full_name || "Unknown User"
            }
          };
        }),
        ...(commentsResult.data || []).map(comment => {
          const post = postDetails.find(p => p.id === comment.post_id);
          return {
            id: comment.id,
            type: "comment" as const,
            created_at: comment.created_at,
            data: {
              post_id: comment.post_id,
              content: comment.content,
              post_content: post?.content || "",
              post_author: post?.profiles?.full_name || "Unknown User"
            }
          };
        })
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
       .slice(0, 15);
      
      setPosts(postsData || []);
      setActivities(activitiesData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchData(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInMonths / 12);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 30) return `${diffInDays}d`;
    if (diffInMonths < 12) return `${diffInMonths}mo`;
    return `${diffInYears}y`;
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part?.[0] || "")
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const ActivityCard = ({ activity }: { activity: Activity }) => {
    return (
      <Card className="mb-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {activity.type === "comment" && (
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
              )}
              {activity.type === "like" && (
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Heart className="h-5 w-5 text-red-600" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900">
                  {activity.type === "comment" ? "Commented on a post" : "Liked a post"}
                </span>
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDate(activity.created_at)}
                </span>
              </div>
              <div className="mb-2">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {activity.data.post_author}
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {activity.type === "comment" && activity.data.content}
                  {activity.type === "like" && activity.data.post_content}
                </p>
              </div>
              <Link
                href={`/post/${activity.data.post_id}`}
                className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                View post →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            Last updated: {formatDate(lastRefresh.toISOString())}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 w-8 p-0"
          >
            {refreshing ? (
              <InlineLoader size="sm" variant="rotate" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Tabs Component */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-50 p-1 rounded-lg">
          <TabsTrigger 
            value="posts" 
            className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            Posts
          </TabsTrigger>
          <TabsTrigger 
            value="activity"
            className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            <Users className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
        </TabsList>

        {/* Posts Tab - Using same structure as feed page */}
        <TabsContent value="posts" className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[120px]" />
                        <Skeleton className="h-3 w-[160px]" />
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <Skeleton className="h-[200px] w-full rounded-md" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostItem 
                  key={post.id} 
                  post={post} 
                  currentUser={currentUser}
                  onPostDeleted={(postId) => {
                    setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
                  }}
                  onPostUpdated={(postId, updatedContent) => {
                    setPosts(prevPosts => 
                      prevPosts.map(p => 
                        p.id === postId 
                          ? { ...p, content: updatedContent, updated_at: new Date().toISOString() }
                          : p
                      )
                    );
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No posts yet</p>
              <p className="text-sm text-gray-400 mt-1">
                {isOwnProfile ? "Share your thoughts with your network" : "This user hasn't posted anything yet"}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activities.length > 0 ? (
            <ScrollArea className="h-[600px] pr-4">
              {activities.map((activity, index) => (
                <ActivityCard key={`${activity.id}-${activity.type}-${index}`} activity={activity} />
              ))}
            </ScrollArea>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No recent activity</p>
              <p className="text-sm text-gray-400 mt-1">
                {isOwnProfile 
                  ? "Start engaging with posts by liking and commenting to see your activity here" 
                  : "This user hasn't engaged with any posts yet"
                }
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
