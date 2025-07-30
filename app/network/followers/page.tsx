"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  MessageSquare, 
  Search, 
  ArrowRight,
  Calendar,
  Building2,
  Globe,
  Sparkles,
  User,
  Heart,
  Eye
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { FollowButton } from "@/components/follow-button";
import useSWR from 'swr';

interface Follower {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    headline?: string;
    avatar_url?: string;
    username: string;
    company?: string;
    location?: string;
  };
}

interface Following {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    headline?: string;
    avatar_url?: string;
    username: string;
    company?: string;
    location?: string;
  };
}

export default function FollowersPage() {
  const { session, isLoading: authLoading } = useAuth();
  const user = session?.user;
  const { toast } = useToast();
  
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("followers");

  const fetchFollowers = async (userId: string): Promise<Follower[]> => {
    try {
      console.log('Fetching followers for user:', userId);
    const { data, error } = await supabase
      .from("follows")
        .select("id, follower_id, following_id, created_at, profiles!follower_id (id, full_name, headline, avatar_url, username, company, location)")
        .eq("following_id", userId);
      
    if (error) {
      console.error('Followers fetch error:', error);
      throw error;
    }
      
      console.log('Followers data received:', data);
      // Transform the data to handle the array structure
      return (data || []).map(item => ({
        ...item,
        profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
      })).filter(item => item.profiles);
  } catch (err) {
    console.error('Followers fetch exception:', err);
    throw err;
  }
};

  const fetchFollowing = async (userId: string): Promise<Following[]> => {
    try {
      console.log('Fetching following for user:', userId);
      const { data, error } = await supabase
        .from("follows")
        .select("id, follower_id, following_id, created_at, profiles!following_id (id, full_name, headline, avatar_url, username, company, location)")
        .eq("follower_id", userId);
      
      if (error) {
        console.error('Following fetch error:', error);
        throw error;
      }
      
      console.log('Following data received:', data);
      // Transform the data to handle the array structure
      return (data || []).map(item => ({
        ...item,
        profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
      })).filter(item => item.profiles);
    } catch (err) {
      console.error('Following fetch exception:', err);
      throw err;
    }
  };

  const {
    data: followers = [],
    isLoading: loadingFollowers,
    mutate: mutateFollowers
  } = useSWR(user && user.id ? ["followers", user.id] : null, () => fetchFollowers(user!.id));

  const {
    data: following = [],
    isLoading: loadingFollowing,
    mutate: mutateFollowing
  } = useSWR(user && user.id ? ["following", user.id] : null, () => fetchFollowing(user!.id));

  const loading = authLoading || loadingFollowers || loadingFollowing;

  // Filter functions
  const filteredFollowers = followers.filter(follower =>
    follower.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    follower.profiles?.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    follower.profiles?.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFollowing = following.filter(followingItem =>
    followingItem.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    followingItem.profiles?.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    followingItem.profiles?.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) {
  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="lg:col-span-3 space-y-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Following & Followers</h1>
          <p className="text-gray-600">Manage your social connections and see who's following you</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Social Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Followers</span>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {followers.length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Following</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {following.length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Connections</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {followers.length + following.length}
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Link href="/network" className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <UserCheck className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">My Network</span>
                    <ArrowRight className="h-4 w-4 ml-auto text-gray-400" />
                  </Link>
                  <Link href="/network/connections" className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <UserCheck className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Connections</span>
                    <ArrowRight className="h-4 w-4 ml-auto text-gray-400" />
                  </Link>
                  <Link href="/groups" className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <Building2 className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Groups</span>
                    <ArrowRight className="h-4 w-4 ml-auto text-gray-400" />
                  </Link>
                  <Link href="/events" className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Events</span>
                    <ArrowRight className="h-4 w-4 ml-auto text-gray-400" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="w-full overflow-x-auto scrollbar-hide">
                  <TabsList className="flex w-max min-w-full gap-2">
                    <TabsTrigger value="followers" className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Followers
                      {followers.length > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                          {followers.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="following" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Following
                      {following.length > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                          {following.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>
                <div className="w-full sm:w-auto mt-2 sm:mt-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search people..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                </div>
              </div>

              {/* Followers Tab */}
              <TabsContent value="followers" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      People Following You ({followers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {followers.length > 0 ? (
                      <div className="space-y-4">
                        {filteredFollowers.map((follower) => (
                          <div key={follower.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={follower.profiles.avatar_url} />
                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                                  {follower.profiles.full_name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-gray-900">{follower.profiles.full_name}</h3>
                                <p className="text-sm text-gray-600">{follower.profiles.headline}</p>
                                {follower.profiles.company && (
                                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <Building2 className="h-3 w-3" />
                                    {follower.profiles.company}
                                  </p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                  Started following {new Date(follower.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/messages?userId=${follower.profiles.id}`}>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Message
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/profile/${follower.profiles.username}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Profile
                                </Link>
                              </Button>
                              {user && (
                                <FollowButton userId={user.id} profileId={follower.profiles.id} />
                              )}
                            </div>
      </div>
                        ))}
      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No followers yet</p>
                        <p className="text-sm">Start sharing content to attract followers!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Following Tab */}
              <TabsContent value="following" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      People You're Following ({following.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {following.length > 0 ? (
        <div className="space-y-4">
                        {filteredFollowing.map((followingItem) => (
                          <div key={followingItem.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={followingItem.profiles.avatar_url} />
                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                                  {followingItem.profiles.full_name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-gray-900">{followingItem.profiles.full_name}</h3>
                                <p className="text-sm text-gray-600">{followingItem.profiles.headline}</p>
                                {followingItem.profiles.company && (
                                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <Building2 className="h-3 w-3" />
                                    {followingItem.profiles.company}
                                  </p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                  Started following {new Date(followingItem.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/messages?userId=${followingItem.profiles.id}`}>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Message
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/profile/${followingItem.profiles.username}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Profile
                                </Link>
                              </Button>
                              {user && (
                                <FollowButton userId={user.id} profileId={followingItem.profiles.id} />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Not following anyone yet</p>
                        <p className="text-sm">Start following people to see their updates!</p>
            </div>
          )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
} 