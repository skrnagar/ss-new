"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { CompanyPostDialog } from "@/components/company-post-dialog";
import { useAuth } from "@/contexts/auth-context";
import { formatDistanceToNow } from "date-fns";

interface CompanyPostSectionProps {
  companyId: string;
  isAdmin: boolean;
  initialPosts: any[];
}

export function CompanyPostSection({ companyId, isAdmin, initialPosts }: CompanyPostSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [posts, setPosts] = useState(initialPosts);
  const { session } = useAuth();

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    // Refresh posts
    window.location.reload();
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Updates</CardTitle>
          {isAdmin && session?.user?.id && (
            <Button size="sm" variant="outline" onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Post Update
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {posts && posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post: any) => (
                <div key={post.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={post.profiles?.avatar_url} />
                      <AvatarFallback>{post.profiles?.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{post.profiles?.full_name}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No updates yet</p>
              {isAdmin && (
                <p className="text-xs text-muted-foreground mt-2">
                  Be the first to share an update with your followers
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {isAdmin && session?.user?.id && (
        <CompanyPostDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          companyId={companyId}
          userId={session.user.id}
        />
      )}
    </>
  );
}

