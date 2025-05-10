
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { PostDialog } from "./post-dialog";
import Link from "next/link";
import { Image, FileVideo, FileText, BookOpen } from "lucide-react";

export function PostTrigger() {
  const [open, setOpen] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
    const handleOpenDialog = () => setOpen(true);
    window.addEventListener('openPostDialog', handleOpenDialog);
    return () => window.removeEventListener('openPostDialog', handleOpenDialog);
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part?.[0] || "")
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={profile?.avatar_url || ""}
                alt={profile?.full_name || "User"}
              />
              <AvatarFallback>
                {getInitials(profile?.full_name || "")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Button
                variant="outline"
                className="w-full h-auto justify-start px-4 py-3 text-muted-foreground text-left"
                onClick={() => setOpen(true)}
              >
                Share your thoughts...
              </Button>
              <div className="flex mt-3 gap-1">
                <Button variant="ghost" className="flex-1" onClick={() => setOpen(true)}>
                  <Image className="h-5 w-5 mr-2" />
                  Photo
                </Button>
                <Button variant="ghost" className="flex-1" onClick={() => setOpen(true)}>
                  <FileVideo className="h-5 w-5 mr-2" />
                  Video
                </Button>
                <Button variant="ghost" className="flex-1" onClick={() => setOpen(true)}>
                  <FileText className="h-5 w-5 mr-2" />
                  Article
                </Button>
                <Button variant="ghost" className="flex-1" asChild>
                  <Link href="/knowledge/contribute">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Knowledge
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <PostDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
