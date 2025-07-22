"use client";
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import useSWRInfinite from 'swr/infinite';
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FollowButton } from "@/components/follow-button";
import { useToast } from "@/hooks/use-toast";
import { NotificationDropdown } from "@/components/notification-dropdown";

const PAGE_SIZE = 10;
const fetchFollowersPage = async (userId: string | undefined, page: number) => {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from("follows")
      .select("follower_id, profiles: follower_id (id, username, full_name, avatar_url, headline)")
      .eq("following_id", userId)
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    if (error) {
      console.error('Followers fetch error:', error);
      throw error;
    }
    return data || [];
  } catch (err) {
    console.error('Followers fetch exception:', err);
    throw err;
  }
};

const FollowerListItem = React.memo(function FollowerListItem({ profiles, userId }: { profiles: any, userId: string }) {
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

export default function FollowersPage() {
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
    (index: number) => userId ? ["followers", userId, index] : null,
    (_: any, userId: string, page: number) => fetchFollowersPage(userId, page),
    { revalidateAll: false }
  );
  const followers = useMemo(() => (data ? data.flat() : []), [data]);
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
  if (isLoading) return <div className="container py-8">Loading followers...</div>;
  if (error) return <div className="container py-8 text-red-500">Error loading followers.<br/>{error.message ? error.message : String(error)}</div>;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Followers</h1>
      </div>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Notifications</h2>
        {/* ...existing notifications code... */}
      </div>
      {followers.length === 0 ? (
        <div className="text-muted-foreground">You have no followers yet.</div>
      ) : (
        <div className="space-y-4">
          {followers.map(({ profiles }) => {
            if (Array.isArray(profiles)) return null;
            const p = profiles as any;
            if (!p || !p.id) return null;
            return <FollowerListItem key={p.id} profiles={p} userId={userId} />;
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