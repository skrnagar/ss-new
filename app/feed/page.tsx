"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { Briefcase, Clock, MapPin, MessageSquare, Share2, ThumbsUp, User } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { unstable_serialize } from "swr";

// Import dynamically to avoid SSR issues - properly resolving to component functions
const PostCreator = dynamic(
  () => import("@/components/post-creator").then((mod) => mod.PostCreator),
  {
    ssr: false,
    loading: () => (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-20 w-full rounded-md" />
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20 rounded-md" />
                  <Skeleton className="h-8 w-20 rounded-md" />
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
  }
);

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
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile: userProfile, isLoading: authLoading, session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);

        // Fetch posts with user information
        const { data, error } = await supabase
          .from("posts")
          .select(`
            *,
            profile:user_id (
              id,
              username,
              full_name,
              avatar_url,
              position,
              company
            )
          `)
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) {
          throw error;
        }

        if (data) {
          setPosts(data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();

    // Subscribe to new posts
    const postsSubscription = supabase
      .channel("public:posts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
        },
        async (payload) => {
          // When a new post is created, fetch its user data as well
          const { data: newPostWithUser } = await supabase
            .from("posts")
            .select(`
            *,
            profile:user_id (
              id,
              username,
              full_name,
              avatar_url,
              position,
              company
            )
          `)
            .eq("id", payload.new.id)
            .single();

          if (newPostWithUser) {
            setPosts((prevPosts) => [newPostWithUser, ...prevPosts]);
          }
        }
      )
      .subscribe();

    return () => {
      postsSubscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Post creation card */}
          {/* Show skeleton state while auth is loading */}
          {authLoading ? (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-20 w-full rounded-md" />
                    <div className="flex justify-between">
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-20 rounded-md" />
                        <Skeleton className="h-8 w-20 rounded-md" />
                        <Skeleton className="h-8 w-20 rounded-md" />
                      </div>
                      <Skeleton className="h-8 w-16 rounded-md" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : session && user ? (
            userProfile ? (
              <PostCreator userProfile={userProfile} />
            ) : (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium mb-2">Complete your profile</h3>
                    <p className="text-muted-foreground mb-4">
                      Set up your profile to start posting and connecting with others.
                    </p>
                    <Button onClick={() => router.push("/profile/setup")}>
                      Set Up Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          ) : (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <h3 className="text-lg font-medium">Sign in to create posts and interact with the community</h3>
                  </div>
                  <Button asChild>
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Posts list */}
          {loading ? (
            // Loading skeletons
            Array(3)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="mb-4">
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
              ))
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id}>{post && <PostItem post={post} currentUser={userProfile} />}</div>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-xl font-medium mb-2">No posts yet</p>
                <p className="text-muted-foreground">
                  Be the first to share something with the community!
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right sidebar */}
        <div className="hidden md:block space-y-6">
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
                        <p className="text-xs text-muted-foreground">ESG Analyst at Green Metrics</p>
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
        </div>
      </div>
    </div>
  );
}