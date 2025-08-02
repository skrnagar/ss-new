"use client";

import PostItem from "@/components/post-item";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface PostActionsProps {
  post: any;
  currentUser: any;
}

export function PostActions({ post, currentUser }: PostActionsProps) {
  const router = useRouter();

  const handlePostDeleted = (postId: string) => {
    console.log("Post deleted, redirecting to feed");
    router.push('/feed');
  };

  const handlePostUpdated = (postId: string, updatedContent: string) => {
    console.log("Post updated:", postId);
    // The post will be updated in the database, so we can just refresh the page
    router.refresh();
  };

  return (
    <Card className="mb-6">
      <PostItem 
        post={post} 
        currentUser={currentUser}
        onPostDeleted={handlePostDeleted}
        onPostUpdated={handlePostUpdated}
      />
    </Card>
  );
} 