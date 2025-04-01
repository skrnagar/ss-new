"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { Search, Users, Calendar } from "lucide-react";
import { PostTrigger } from "@/components/post-trigger";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import PostItem from "@/components/post-item";
import { getPaginationQuery } from "@/lib/pagination-utils";

export default function FeedPage() {
  const { user, profile: userProfile, isLoading: authLoading } = useAuth();
  const { ref, inView } = useInView();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam = null }) => {
      const pagination = getPaginationQuery({ cursor: pageParam, limit: 10 });

      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles (*)
        `)
        .order("created_at", { ascending: false })
        .limit(pagination.limit);

      if (error) throw error;
      return data || [];
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length === 0) return null;
      return lastPage[lastPage.length - 1]?.created_at;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (status === "loading") return <div>Loading...</div>;
  if (status === "error") return <div>Error: {error.message}</div>;

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
          <PostTrigger />
          <div className="space-y-6">
            {data?.pages.map((page, i) => (
              <div key={i}>
                {page.map((post) => (
                  <PostItem key={post.id} post={post} currentUser={user} />
                ))}
              </div>
            ))}
          </div>
          <div ref={ref} className="h-10" />
        </div>

        {/* Right sidebar */}
        <div className="col-span-3 hidden lg:block space-y-6">
          {/* Events and Suggestions sections removed for brevity */}
        </div>
      </div>
    </div>
  );
}