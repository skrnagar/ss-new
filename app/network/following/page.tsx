"use client";
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import useSWRInfinite from 'swr/infinite';
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FollowButton } from "@/components/follow-button";

const PAGE_SIZE = 10;
const fetchFollowingPage = async (userId: string, page: number) => {
  const { data, error } = await supabase
    .from("follows")
    .select("following_id, profiles: following_id (id, username, full_name, avatar_url, headline)")
    .eq("follower_id", userId)
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
  if (error) throw error;
  return data || [];
};

const FollowingListItem = React.memo(function FollowingListItem({ profiles, userId }: { profiles: any, userId: string }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded shadow">
      <Avatar className="h-12 w-12">
        <AvatarImage src={profiles.avatar_url || undefined} alt={profiles.full_name || profiles.username} />
        <AvatarFallback>{(profiles.full_name || profiles.username || "U").slice(0,2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <Link href={`/profile/${profiles.username}`} className="font-semibold hover:underline">
          {profiles.full_name || profiles.username}
        </Link>
        <div className="text-sm text-muted-foreground">{profiles.headline}</div>
      </div>
      <div className="flex gap-2">
        <FollowButton userId={userId} profileId={profiles.id} />
        <Button asChild variant="outline" size="sm" aria-label="Message user" className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary">
          <Link href={`/messages?userId=${profiles.id}`}>Message</Link>
        </Button>
      </div>
    </div>
  );
});

export default function FollowingPage() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const observerRef = useRef<HTMLDivElement | null>(null);
  const {
    data,
    error,
    isLoading,
    setSize,
    size,
    isValidating
  } = useSWRInfinite(
    (index: number) => userId ? ["following", userId, index] : null,
    (_: any, userId: string, page: number) => fetchFollowingPage(userId, page),
    { revalidateAll: false }
  );
  const following = useMemo(() => (data ? data.flat() : []), [data]);
  const isReachingEnd = data && data[data.length - 1]?.length < PAGE_SIZE;

  // Infinite scroll logic
  useEffect(() => {
    if (!observerRef.current || isReachingEnd) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isReachingEnd && !isValidating) {
        setSize(size + 1);
      }
    }, { threshold: 1 });
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [size, setSize, isReachingEnd, isValidating]);

  if (!userId) return <div className="container py-8">Please log in.</div>;
  if (isLoading) return <div className="container py-8">Loading following...</div>;
  if (error) return <div className="container py-8 text-red-500">Error loading following.</div>;

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">You’re Following</h1>
      {following.length === 0 ? (
        <div className="text-muted-foreground">You’re not following anyone yet.</div>
      ) : (
        <div className="space-y-4">
          {following.map(({ profiles }) => {
            if (Array.isArray(profiles)) return null;
            const p = profiles as any;
            if (!p || !p.id) return null;
            return <FollowingListItem key={p.id} profiles={p} userId={userId} />;
          })}
          {!isReachingEnd && (
            <div ref={observerRef} className="h-8 flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Loading more...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 