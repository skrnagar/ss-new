"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { Search, BookmarkIcon, Users, Calendar, Newspaper } from "lucide-react";
import { PostTrigger } from "@/components/post-trigger";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock } from "lucide-react";
import { User } from "lucide-react";


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
    author_id: string;
    updated_at?: string;
  }

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [lastCursor, setLastCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const POSTS_PER_PAGE = 10;

  const fetchPosts = async (cursor: string | null = null) => {
    try {
      let query = supabase
        .from('posts')
        .select('*, profile:profiles(*)')
        .order('created_at', { ascending: false })
        .limit(POSTS_PER_PAGE);

      if (cursor) {
        query = query.lt('created_at', cursor);
      }

      const { data, error } = await query;

      if (error) throw error;

      const newPosts = data || [];
      setPosts(prev => cursor ? [...prev, ...newPosts] : newPosts);
      setHasMore(newPosts.length === POSTS_PER_PAGE);
      setLastCursor(newPosts[newPosts.length - 1]?.created_at || null);

    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const [events, setEvents] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const { user, profile: userProfile, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const fetchEvents = async () => {
    try {
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('is_public', true)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(2);

      setEvents(eventData || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchSuggestions = async () => {
    if (!user) return;
    try {
      // Get existing connections to exclude them
      const { data: connections } = await supabase
        .from('connections')
        .select('connected_user_id')
        .eq('user_id', user.id);

      const connectedIds = connections?.map(c => c.connected_user_id) || [];
      connectedIds.push(user.id); // Add current user to excluded list

      // Get suggested profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .not('id', 'in', `(${connectedIds.join(',')})`)
        .limit(3);

      setSuggestions(profiles || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleConnect = async (profileId: string) => {
    if (!user) return;
    try {
      await supabase
        .from('connections')
        .insert([
          { user_id: user.id, connected_user_id: profileId, status: 'pending' }
        ]);

      // Refresh suggestions after connecting
      fetchSuggestions();
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
    if (user) {
      fetchSuggestions();
    }
  }, [user]);


  useEffect(() => {
    fetchPosts();
  }, []);

  // Intersection Observer for infinite scroll
  const observerRef = useRef<IntersectionObserver>();
  const lastPostRef = useCallback((node: HTMLElement | null) => {
    if (postsLoading) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchPosts(lastCursor);
      }
    });

    if (node) observerRef.current.observe(node);
  }, [postsLoading, hasMore, lastCursor]);


  return (
    <div className="container py-6">
      <div className="grid grid-cols-11 gap-6">
        {/* Left Sidebar */}
        <div className="col-span-2 hidden lg:block space-y-6">
          {userProfile && (
            <div className="transition-shadow">
              <Link href={`/profile/${userProfile.id}`} className="block">
                <Card>
                  <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Image
                    src={userProfile.avatar_url || "/placeholder-user.jpg"}
                    alt={userProfile.full_name || "User"}
                    width={60}
                    height={60}
                    className="rounded-full hover:opacity-90 transition-opacity"
                  />
                  <h3 className="font-semibold text-sm mt-2">{userProfile.full_name || "User"}</h3>
                  {userProfile.headline && (
                    <p className="text-xs text-gray-500 text-center line-clamp-2 mt-1">
                      {userProfile.headline}
                    </p>
                  )}
                </div>
                    </CardContent>
                      </Card>
              </Link>
            </div>
          )}

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Link href="/network" className="flex items-center gap-3 hover:text-primary">
                  <Users className="h-5 w-5" />
                  <div>
                    <h3 className="font-medium">My Connections</h3>
                  </div>
                </Link>
                <Link href="/network/professionals" className="flex items-center gap-3 hover:text-primary">
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
        <div className="col-span-12 lg:col-span-6">
          <PostTrigger/>
          {postsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <PostItem key={i} post={{}} currentUser={null} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post, index) => (
                <div ref={index === posts.length -1 ? lastPostRef : null} key={post.id}>
                  <PostItem key={post.id} post={post} currentUser={user} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="col-span-3 hidden lg:block space-y-6">


          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Upcoming Events</h3>
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
                          {new Date(event.start_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
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

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Suggested Connections</h3>
              {authLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-36" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-16 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : suggestions.length > 0 ? (
                <div className="space-y-4">
                  {suggestions.slice(0, 3).map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile.avatar_url} />
                          <AvatarFallback>
                            {profile.full_name?.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{profile.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {profile.headline}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleConnect(profile.id)}
                      >
                        Connect
                      </Button>
                    </div>
                  ))}
                  <Button variant="link" className="px-0" asChild>
                    <Link href="/network">See more suggestions</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No suggestions available</p>
                  <Button variant="link" className="mt-2" asChild>
                    <Link href="/network">Browse all professionals</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Network Navigation Card */}

        </div>
      </div>
    </div>
  );
}