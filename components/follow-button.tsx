"use client";
import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const FollowButton = React.memo(function FollowButton({ userId, profileId }: { userId: string; profileId: string }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (!userId || !profileId) return;
    let ignore = false;
    async function checkFollowing() {
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", userId)
        .eq("following_id", profileId)
        .single();
      if (!ignore) setIsFollowing(!!data);
    }
    checkFollowing();
    return () => { ignore = true; };
  }, [userId, profileId]);

  const handleFollow = useCallback(async () => {
    setLoading(true);
    setIsFollowing(true);
    const { error } = await supabase.from("follows").insert({ follower_id: userId, following_id: profileId });
    setLoading(false);
    if (error) {
      setIsFollowing(false);
      toast({ title: "Error", description: "Failed to follow user.", variant: "destructive" });
    } else {
      toast({ title: "Followed", description: "You are now following this user." });
    }
  }, [userId, profileId, toast]);

  const handleUnfollow = useCallback(async () => {
    setLoading(true);
    setIsFollowing(false);
    const { error } = await supabase.from("follows").delete().eq("follower_id", userId).eq("following_id", profileId);
    setLoading(false);
    if (error) {
      setIsFollowing(true);
      toast({ title: "Error", description: "Failed to unfollow user.", variant: "destructive" });
    } else {
      toast({ title: "Unfollowed", description: "You have unfollowed this user." });
    }
  }, [userId, profileId, toast]);

  if (userId === profileId) return null;

  return isFollowing ? (
    <Button variant="outline" size="sm" onClick={handleUnfollow} disabled={loading} aria-label="Unfollow user" className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary">
      Unfollow
    </Button>
  ) : (
    <Button variant="default" size="sm" onClick={handleFollow} disabled={loading} aria-label="Follow user" className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary">
      Follow
    </Button>
  );
}); 