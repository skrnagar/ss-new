"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { Search, BookmarkIcon, Users, Calendar, Newspaper, UserPlus, UserCheck, UserX, TrendingUp, Eye, Heart } from "lucide-react";
import { PostTrigger } from "@/components/post-trigger";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { User } from "lucide-react";
import useSWR, { mutate as globalMutate } from 'swr';
import { ProfileCard } from "@/components/profile-card";
import { InlineLoader } from "@/components/ui/logo-loder";

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

export default function FeedPage() {
  interface Post {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    updated_at?: string;
  }

  const { session, profile: userProfile, isLoading: authLoading } = useAuth();
  const user = session?.user;

  const POSTS_PER_PAGE = 10;

  // Infinite scroll state
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [connectingUsers, setConnectingUsers] = useState<Set<string>>(new Set());

  const fetchPosts = async (pageNum = 1) => {
    const from = (pageNum - 1) * POSTS_PER_PAGE;
    const to = from + POSTS_PER_PAGE - 1;
    const { data, error } = await supabase
      .from("posts")
      .select("*, profile:profiles(*)")
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw error;
    return data;
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("is_public", true)
      .gte("start_date", new Date().toISOString())
      .order("start_date", { ascending: true })
      .limit(2);
    if (error) throw error;
    return data;
  };

  const fetchTrendingArticles = async () => {
    const { data, error } = await supabase
      .from("articles_with_author")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(5);
    if (error) throw error;
    return data;
  };

  const fetchSuggestions = async (userId: string) => {
    if (!userId) return [];
    
    try {
      // Get all connections for the current user (both sent and received)
      const [sentConnections, receivedConnections] = await Promise.all([
        supabase
          .from("connections")
          .select("connected_user_id")
          .eq("user_id", userId)
          .eq("status", "accepted"),
        supabase
          .from("connections")
          .select("user_id")
          .eq("connected_user_id", userId)
          .eq("status", "accepted")
      ]);

      // Get all connections (both sent and received, any status)
      const [allSentConnections, allReceivedConnections] = await Promise.all([
        supabase
          .from("connections")
          .select("connected_user_id, status")
          .eq("user_id", userId),
        supabase
          .from("connections")
          .select("user_id, status")
          .eq("connected_user_id", userId)
      ]);

      const connectedIds = new Set([
        userId,
        ...(sentConnections.data?.map((c) => c.connected_user_id) || []),
        ...(receivedConnections.data?.map((c) => c.user_id) || [])
      ]);

      // Get all users with any connection status (pending, accepted, etc.)
      const allConnectedUserIds = new Set([
        userId,
        ...(allSentConnections.data?.map((c) => c.connected_user_id) || []),
        ...(allReceivedConnections.data?.map((c) => c.user_id) || [])
      ]);

      // Get all profiles not already connected (including pending requests)
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, full_name, headline, avatar_url, username, bio, company, position")
        .neq("id", userId)
        .not("id", "in", `(${Array.from(allConnectedUserIds).join(",")})`)
        .limit(20);

      if (error) {
        console.error("Error fetching profiles:", error);
        return [];
      }

      if (!profiles || profiles.length === 0) return [];

      // For each profile, count mutual connections
      const suggestionsWithMutuals = await Promise.all(
        profiles.map(async (profile) => {
          try {
            // Get their connections
            const { data: theirConnections } = await supabase
              .from("connections")
              .select("user_id, connected_user_id")
              .or(`user_id.eq.${profile.id},connected_user_id.eq.${profile.id}`)
              .eq("status", "accepted");

            if (!theirConnections) return { ...profile, mutualCount: 0 };

            const theirConnectedIds = theirConnections.map((c) => 
              c.user_id === profile.id ? c.connected_user_id : c.user_id
            );

            // Count mutuals
            const mutualCount = theirConnectedIds.filter((id) => connectedIds.has(id)).length;
            return { ...profile, mutualCount };
          } catch (error) {
            console.error("Error calculating mutual connections for profile:", profile.id, error);
            return { ...profile, mutualCount: 0 };
          }
        })
      );

      // Sort by mutualCount descending and return top 5
      suggestionsWithMutuals.sort((a, b) => b.mutualCount - a.mutualCount);
      return suggestionsWithMutuals.slice(0, 5);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      return [];
    }
  };

  const { data: posts, error: postsError, isLoading: postsLoading, mutate } = useSWR(
    !authLoading && user ? 'posts' : null,
    () => fetchPosts(1)
  );
  const { data: events = [], error: eventsError } = useSWR('events', fetchEvents);
  const { data: trendingArticles = [], error: trendingArticlesError } = useSWR('trending-articles', fetchTrendingArticles);
  const { data: suggestions = [], error: suggestionsError } = useSWR(
    !authLoading && user ? ['suggestions', user.id] : null,
    () => (user ? fetchSuggestions(user.id) : [])
  );
  const router = useRouter();

  // Load more posts when page changes
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoadingMore(true);
      try {
        const newPosts = await fetchPosts(page);
        if (!ignore) {
          setAllPosts((prev) => {
            // Avoid duplicates
            const ids = new Set(prev.map((p) => p.id));
            return [...prev, ...newPosts.filter((p: any) => !ids.has(p.id))];
          });
          if (newPosts.length < POSTS_PER_PAGE) setHasMore(false);
        }
      } catch (e) {
        setHasMore(false);
      } finally {
        setLoadingMore(false);
      }
    };
    if (page > 1) load();
    return () => { ignore = true; };
  }, [page]);

  // On initial posts load, set allPosts
  useEffect(() => {
    if (posts && page === 1) {
      setAllPosts(posts);
      setHasMore(posts.length === POSTS_PER_PAGE);
    }
  }, [posts]);

  const handleConnect = async (profileId: string) => {
    if (!user) return;
    
    // Add to connecting state
    setConnectingUsers(prev => new Set(prev).add(profileId));
    
    try {
      const { error } = await supabase
        .from("connections")
        .insert([{ user_id: user.id, connected_user_id: profileId, status: "pending" }])
        .select();

      if (error) {
        if (error.code === '23505') {
          // Duplicate key error - connection already exists
          console.log("Connection request already sent");
          // Refresh suggestions to update the UI
          globalMutate(['suggestions', user.id]);
        } else {
          console.error("Error sending connection request:", error);
        }
        return;
      }

      // Refresh suggestions after connecting
      globalMutate(['suggestions', user.id]);
      
      // Show success feedback
      console.log("Connection request sent successfully!");
      
      // You could add a toast notification here if you have a toast system
      // toast({
      //   title: "Connection request sent!",
      //   description: "We'll notify you when they respond.",
      // });
    } catch (error) {
      console.error("Error sending connection request:", error);
    } finally {
      // Remove from connecting state
      setConnectingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(profileId);
        return newSet;
      });
    }
  };

  const handleWithdrawRequest = async (profileId: string) => {
    if (!user) return;
    
    // Add to connecting state
    setConnectingUsers(prev => new Set(prev).add(profileId));
    
    try {
      const { error } = await supabase
        .from("connections")
        .delete()
        .eq("user_id", user.id)
        .eq("connected_user_id", profileId)
        .eq("status", "pending");

      if (error) {
        console.error("Error withdrawing connection request:", error);
        return;
      }

      // Refresh suggestions after withdrawing
      globalMutate(['suggestions', user.id]);
      
      console.log("Connection request withdrawn successfully!");
    } catch (error) {
      console.error("Error withdrawing connection request:", error);
    } finally {
      // Remove from connecting state
      setConnectingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(profileId);
        return newSet;
      });
    }
  };

  // Intersection Observer for infinite scroll
  const observerRef = useRef<IntersectionObserver>();
  const lastPostRef = useCallback(
    (node: HTMLElement | null) => {
      if (loadingMore || postsLoading || !hasMore) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [loadingMore, postsLoading, hasMore]
  );

  return (
    <div className="container py-6">
      <div className="grid grid-cols-11 gap-6 relative">
        {/* Left Sidebar */}
        <div className="col-span-2 hidden lg:block space-y-6 relative">
          {userProfile && <ProfileCard profile={userProfile} />}

          <Card className="sticky top-8 z-10 bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Link href="/network" className="flex items-center gap-3 hover:text-primary">
                  <Users className="h-5 w-5" />
                  <div>
                    <h3 className="font-medium">My Connections</h3>
                  </div>
                </Link>
                <Link
                  href="/network"
                  className="flex items-center gap-3 hover:text-primary"
                >
                  <Search className="h-5 w-5" />
                  <div>
                    <h3 className="font-medium">Explore People</h3>
                  </div>
                </Link>
                <Link href="/groups" className="flex items-center gap-3 hover:text-primary">
                  <Users className="h-5 w-5" />
                  <div>
                    <h3 className="font-medium">Groups</h3>
                  </div>
                </Link>
                <Link href="/events" className="flex items-center gap-3 hover:text-primary">
                  <Calendar className="h-5 w-5" />
                  <div>
                    <h3 className="font-medium">Events</h3>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Main Content */}
        <div className="col-span-12 lg:col-span-6 relative z-0">
          <PostTrigger onPostSuccess={() => {
            setPage(1);
            mutate();
          }} />
          {(postsLoading || authLoading) && page === 1 ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <PostItem
                  key={i}
                  post={{
                    id: `skeleton-${i}`,
                    user_id: "",
                    created_at: "",
                  }}
                  currentUser={null}
                />
              ))}
            </div>
          ) : allPosts.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">No posts yet. Be the first to post!</div>
          ) : (
            <div className="space-y-4">
              {allPosts.map((post, index) => (
                <div ref={index === allPosts.length - 1 ? lastPostRef : null} key={post.id}>
                  <PostItem key={post.id} post={post} currentUser={user} />
                </div>
              ))}
              {loadingMore && (
                <div className="flex justify-center py-4">
                  <InlineLoader variant="rotate" size="sm" />
                </div>
              )}
              {!hasMore && allPosts.length > 0 && (
                <div className="text-center text-muted-foreground py-4">No more posts.</div>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="col-span-3 hidden lg:block space-y-6 relative">
          {/* Latest Articles */}
          <Card className="bg-white shadow-sm">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-primary" />
                Latest Articles
              </h3>
              {authLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="border rounded-md p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              ) : trendingArticlesError ? (
                <div className="text-center py-4">
                  <p className="text-sm text-red-500">Error loading articles</p>
                  <Button variant="link" className="mt-2" asChild>
                    <Link href="/articles">Browse all articles</Link>
                  </Button>
                </div>
              ) : trendingArticles.length > 0 ? (
                <div className="space-y-3">
                  {trendingArticles.slice(0, 3).map((article) => (
                    <Link
                      href={`/articles/${article.id}`}
                      key={article.id}
                      className="group block"
                    >
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={article.author_avatar || "/placeholder-user.jpg"} />
                          <AvatarFallback className="text-xs">{article.author_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                            {article.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <span>{article.author_name}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(article.published_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric"
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <div className="pt-2 border-t">
                    <Button variant="link" className="px-0 text-sm w-full justify-start" asChild>
                      <Link href="/articles">See all articles</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Newspaper className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-muted-foreground">No trending articles</p>
                  <Button variant="link" className="mt-2 text-sm" asChild>
                    <Link href="/articles">Browse all articles</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="bg-white shadow-sm">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Events
              </h3>
              {authLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((_, i) => (
                    <div key={i} className="border rounded-md p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              ) : events.length > 0 ? (
                <div className="space-y-3">
                  {events.slice(0, 2).map((event) => (
                    <div key={event.id} className="border rounded-md p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">
                          {new Date(event.start_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {event.description}
                      </p>
                    </div>
                  ))}
                  <Button variant="link" className="px-0" asChild>
                    <Link href="/events">See all events</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No upcoming events</p>
                  <Button variant="link" className="mt-2" asChild>
                    <Link href="/events">Browse all events</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Suggested Connections - Back to Right Sidebar */}
          <Card className="bg-white shadow-sm">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Suggested Connections</h3>
              {authLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-36" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : suggestionsError ? (
                <div className="text-center py-4">
                  <p className="text-sm text-red-500">Error loading suggestions</p>
                  <Button variant="link" className="mt-2" asChild>
                    <Link href="/network">Browse all professionals</Link>
                  </Button>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="space-y-3">
                  {suggestions.map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                            {profile.full_name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate text-gray-900">{profile.full_name}</p>
                          <p className="text-xs text-gray-600 truncate mb-1">{profile.headline}</p>
                          {(profile.company || profile.position) && (
                            <p className="text-xs text-gray-500 truncate mb-1">
                              {profile.position && profile.company ? `${profile.position} at ${profile.company}` : 
                               profile.position || profile.company}
                            </p>
                          )}
                          {profile.mutualCount > 0 && (
                            <span className="text-xs text-blue-600 font-medium">
                              {profile.mutualCount} mutual connection{profile.mutualCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleConnect(profile.id)}
                        disabled={connectingUsers.has(profile.id)}
                        className="flex-shrink-0 ml-2 p-2 hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-50"
                        title="Send connection request"
                      >
                        {connectingUsers.has(profile.id) ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                        ) : (
                          <UserPlus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <Button variant="link" className="px-0 text-sm w-full justify-start" asChild>
                      <Link href="/network">See more suggestions</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-muted-foreground">No suggestions available</p>
                  <Button variant="link" className="mt-2 text-sm" asChild>
                    <Link href="/network">Browse all professionals</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
