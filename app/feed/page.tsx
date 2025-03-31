"use client";

import { useEffect, useState } from "react";
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
  const { user, profile: userProfile, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function fetchPosts() {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data, error } = await supabase
          .from('posts')
          .select('*, profile:profiles(*)')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (mounted) {
          setPosts(data || []);
          setPostsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        if (mounted) {
          setPostsLoading(false);
        }
      }
    }

    fetchPosts();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="container py-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <div className="col-span-2 hidden lg:block space-y-4">
          {userProfile && (
            <div className="rounded-lg bg-white p-3 shadow-sm hover:shadow-md transition-shadow">
              <Link href={`/profile/${userProfile.id}`} className="block">
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
              </Link>
            </div>
          )}

          <nav className="space-y-1">
            <Link href="/saved" className="flex items-center gap-2 rounded-md p-2 text-gray-700 hover:bg-gray-100">
              <BookmarkIcon className="h-5 w-5" />
              <span>Saved items</span>
            </Link>
            <Link href="/groups" className="flex items-center gap-2 rounded-md p-2 text-gray-700 hover:bg-gray-100">
              <Users className="h-5 w-5" />
              <span>Groups</span>
            </Link>
            <Link href="/events" className="flex items-center gap-2 rounded-md p-2 text-gray-700 hover:bg-gray-100">
              <Calendar className="h-5 w-5" />
              <span>Events</span>
            </Link>
            <Link href="/newsletters" className="flex items-center gap-2 rounded-md p-2 text-gray-700 hover:bg-gray-100">
              <Newspaper className="h-5 w-5" />
              <span>Newsletters</span>
            </Link>
          </nav>
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
              {posts.map((post) => (
                <PostItem key={post.id} post={post} currentUser={user} />
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="col-span-3 hidden lg:block space-y-6">
          <Card>
            <CardContent className="pt-6">
              {authLoading ? (
                <div className="flex flex-col items-center text-center mb-4">
                  <Skeleton className="h-16 w-16 rounded-full mb-3" />
                  <Skeleton className="h-5 w-36 mb-2" />
                  <Skeleton className="h-4 w-48 mb-4" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
              ) : userProfile ? (
                <div className="flex flex-col items-center text-center mb-4">
                  <Avatar className="h-16 w-16 mb-3">
                    <AvatarImage
                      src={userProfile.avatar_url || ""}
                      alt={userProfile.full_name || "User"}
                    />
                    <AvatarFallback>
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="font-medium">{userProfile.full_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {userProfile.headline || "No headline"}
                  </p>

                  <Button
                    className="w-full mt-3"
                    variant="outline"
                    onClick={() => router.push(`/profile/${userProfile.username}`)}
                  >
                    View Profile
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-3">
                    Sign in to access your profile and all features
                  </p>
                  <Button onClick={() => router.push("/auth/login")}>Sign In</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Upcoming Events</h3>
              {authLoading ? (
                <div className="space-y-3">
                  <div className="border rounded-md p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="border rounded-md p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="border rounded-md p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Tomorrow, 3:00 PM</span>
                    </div>
                    <h4 className="font-medium">ESG Reporting Best Practices</h4>
                    <p className="text-sm text-muted-foreground">
                      Join industry experts for a webinar on ESG reporting standards
                    </p>
                  </div>

                  <div className="border rounded-md p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">May 15, 2:00 PM</span>
                    </div>
                    <h4 className="font-medium">Workplace Safety Forum</h4>
                    <p className="text-sm text-muted-foreground">
                      Virtual panel discussion on improving safety culture
                    </p>
                  </div>

                  <Button variant="link" className="px-0">
                    See all events
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
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>JP</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">James Peterson</p>
                        <p className="text-xs text-muted-foreground">
                          Safety Director at Construct Co.
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Connect
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>MJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Maria Johnson</p>
                        <p className="text-xs text-muted-foreground">
                          ESG Analyst at Green Metrics
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Connect
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>RL</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Robert Lee</p>
                        <p className="text-xs text-muted-foreground">
                          EHS Manager at Industrial Tech
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Connect
                    </Button>
                  </div>

                  <Button variant="link" className="px-0">
                    See more suggestions
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Network Navigation Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Link href="/network" className="flex items-center gap-3 hover:text-primary">
                  <Users className="h-5 w-5" />
                  <div>
                    <h3 className="font-medium">My Connections</h3>
                    <p className="text-sm text-muted-foreground">Manage your professional network</p>
                  </div>
                </Link>

                <Link href="/network/professionals" className="flex items-center gap-3 hover:text-primary">
                  <Search className="h-5 w-5" />
                  <div>
                    <h3 className="font-medium">Explore People</h3>
                    <p className="text-sm text-muted-foreground">Find ESG & EHS professionals</p>
                  </div>
                </Link>

                <Link href="/groups" className="flex items-center gap-3 hover:text-primary">
                  <Users className="h-5 w-5" />
                  <div>
                    <h3 className="font-medium">Groups</h3>
                    <p className="text-sm text-muted-foreground">Join specialized professional groups</p>
                  </div>
                </Link>

                <Link href="/events" className="flex items-center gap-3 hover:text-primary">
                  <Calendar className="h-5 w-5" />
                  <div>
                    <h3 className="font-medium">Events</h3>
                    <p className="text-sm text-muted-foreground">Discover industry events and conferences</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}