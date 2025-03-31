"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, User, BookmarkIcon, Calendar, Newspaper, Users } from "lucide-react";
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PostTrigger } from "@/components/post-trigger";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";


const PostItem = dynamic(() => import("@/components/post-item"), {
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
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const { user, profile: userProfile, isLoading: authLoading, session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function fetchPosts() {
      try {
        setPostsLoading(true);
        const { data, error } = await supabase
          .from("posts")
          .select(`
            *,
            profiles:user_id (
              id,
              username,
              full_name,
              avatar_url,
              headline,
              position,
              company
            )
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (mounted && data) setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        if (mounted) setPostsLoading(false);
      }
    }

    fetchPosts();

    return () => {
      mounted = false;
    };
  }, []);

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="container max-w-screen-xl py-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="hidden md:block">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card">
              <div className="flex-shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {userProfile?.full_name || "Anonymous User"}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {userProfile?.headline || "No headline"}
                </p>
              </div>
            </div>
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
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <PostTrigger />

          {postsLoading ? (
            <div className="space-y-6">
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
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostItem key={post.id} post={post} currentUser={userProfile} />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="hidden md:block">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Suggested Connections</h3>
              {/* Add suggested connections here */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}