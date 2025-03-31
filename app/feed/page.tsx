"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users } from "lucide-react";

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
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
        if (mounted && data) {
          setPosts(data);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        if (mounted) {
          setPostsLoading(false);
        }
      }
    }

    fetchPosts();
    return () => {
      mounted = false;
    }
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
          {/* Navigation items removed */}
        </div>

        {/* Main Content */}
        <div className="col-span-7">
          {postsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="animate-pulse">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-gray-200" />
                        <div className="space-y-2">
                          <div className="h-4 w-[200px] bg-gray-200 rounded" />
                          <div className="h-3 w-[150px] bg-gray-200 rounded" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post: any) => (
                <Card key={post.id}>
                  <CardContent className="pt-6">
                    <p>{post.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="col-span-3 hidden lg:block">
          <Card>
            <CardContent className="pt-6">
              {userProfile ? (
                <div>
                  <h3 className="font-semibold mb-2">Your Profile</h3>
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