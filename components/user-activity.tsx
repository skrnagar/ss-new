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
  Building
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    username: string;
    avatar_url: string;
    headline: string;
    company: string;
    position: string;
  };
  likes_count: number;
  comments_count: number;
  shares_count: number;
}

interface Activity {
  id: string;
  type: "comment" | "like";
  created_at: string;
  data: {
    content?: string;
    post_id: string;
    posts?: {
      content: string;
      profiles: {
        full_name: string;
        username: string;
        avatar_url: string;
        headline: string;
        company: string;
        position: string;
      };
    };
  };
}

interface UserActivityProps {
  userId: string;
  isOwnProfile: boolean;
}

export function UserActivity({ userId, isOwnProfile }: UserActivityProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch posts with proper relationship
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles!user_id (
            id,
            full_name,
            username,
            avatar_url,
            headline,
            company,
            position
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (postsError) {
        console.error("Error fetching posts:", postsError);
      }

      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (activitiesError) {
        console.error("Error fetching activities:", activitiesError);
      }

      // Fetch likes and comments counts for posts
      const postsWithCounts = await Promise.all(
        (postsData || []).map(async (post: any) => {
          const { count: likesCount } = await supabase
            .from("likes")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id);

          const { count: commentsCount } = await supabase
            .from("comments")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id);

          return {
            ...post,
            likes_count: likesCount || 0,
            comments_count: commentsCount || 0,
            shares_count: 0,
          };
        })
      );

      // Transform posts data to match our interface
      const transformedPosts = postsWithCounts.map((post: any) => ({
        ...post,
        profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles,
      }));
      
      setPosts(transformedPosts);
      setActivities(activitiesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInMonths / 12);

    if (diffInYears > 0) return `${diffInYears}y`;
    if (diffInMonths > 0) return `${diffInMonths}mo`;
    if (diffInDays > 0) return `${diffInDays}d`;
    return "Today";
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

  const PostCard = ({ post }: { post: Post }) => (
    <Card className="mb-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-12 w-12 border-2 border-gray-100">
              <AvatarImage src={post.profiles.avatar_url} alt={post.profiles.full_name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(post.profiles.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900 text-base">
                  {post.profiles.full_name}
                </h3>
                {isOwnProfile && (
                  <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    You
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-1">
                {post.profiles.position && `${post.profiles.position} at `}
                {post.profiles.company || post.profiles.headline}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{formatDate(post.created_at)}</span>
                <span>•</span>
                <Globe className="h-3 w-3" />
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-gray-900 leading-relaxed whitespace-pre-line">
            {post.content}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Button variant="ghost" size="sm" className="flex-1 justify-start text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
            <ThumbsUp className="h-4 w-4 mr-2" />
            <span className="font-medium">Like</span>
            {post.likes_count > 0 && (
              <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
                {post.likes_count}
              </span>
            )}
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 justify-start text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200">
            <MessageSquare className="h-4 w-4 mr-2" />
            <span className="font-medium">Comment</span>
            {post.comments_count > 0 && (
              <span className="ml-1 text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-medium">
                {post.comments_count}
              </span>
            )}
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 justify-start text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200">
            <Share2 className="h-4 w-4 mr-2" />
            <span className="font-medium">Repost</span>
            {post.shares_count > 0 && (
              <span className="ml-1 text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-medium">
                {post.shares_count}
              </span>
            )}
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 justify-start text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200">
            <Send className="h-4 w-4 mr-2" />
            <span className="font-medium">Send</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ActivityCard = ({ activity }: { activity: Activity }) => {
    const [postData, setPostData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchPostData = async () => {
        if (activity.data.post_id) {
          const { data: post } = await supabase
            .from("posts")
            .select(`
              id,
              content,
              profiles!user_id (
                id,
                full_name,
                username,
                avatar_url
              )
            `)
            .eq("id", activity.data.post_id)
            .single();
          
          setPostData(post);
        }
        setLoading(false);
      };

      fetchPostData();
    }, [activity.data.post_id]);

    if (loading) {
      return (
        <Card className="mb-4 border border-gray-200">
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
      );
    }

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
              {postData && (
                <div className="mb-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={postData.profiles?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {getInitials(postData.profiles?.full_name || "User")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-900">
                      {postData.profiles?.full_name || "Unknown User"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {activity.type === "comment" && activity.data.content}
                    {activity.type === "like" && postData.content}
                  </p>
                </div>
              )}
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

        {/* Posts Tab */}
        <TabsContent value="posts" className="mt-6">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3 mb-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-20 w-full mb-4" />
                    <div className="flex space-x-4">
                      <Skeleton className="h-8 flex-1" />
                      <Skeleton className="h-8 flex-1" />
                      <Skeleton className="h-8 flex-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <ScrollArea className="h-[600px] pr-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </ScrollArea>
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
              <p className="text-sm text-gray-400 mt-1">Your activity will appear here</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
