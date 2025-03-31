
"use client";

import { useState } from "react";
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
      <Card className="md:rounded-lg rounded-none border-x-0 md:border-x mb-6">
        <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 md:h-10 md:w-10">
                <AvatarImage
                  src={profile?.avatar_url || ""}
                  alt={profile?.full_name || "User"}
                />
                <AvatarFallback>{getInitials(profile?.full_name || "")}</AvatarFallback>
              </Avatar>
              <Button 
                variant="outline" 
                className="w-full justify-start text-muted-foreground h-10"
                onClick={() => setOpen(true)}
              >
                What's on your mind?
              </Button>
            </div>
            
            <div className="flex justify-between items-center border-t pt-3">
              <Button variant="ghost" className="flex-1" onClick={() => setOpen(true)}>
                <Image className="h-5 w-5 mr-2" />
                Photo
              </Button>
              <Button variant="ghost" className="flex-1" onClick={() => setOpen(true)}>
                <FileVideo className="h-5 w-5 mr-2" />
                Video
              </Button>
              <Button variant="ghost" className="flex-1" asChild>
                <Link href="/articles/create">
                  <FileText className="h-5 w-5 mr-2" />
                  Write article
                </Link>
              </Button>
              <Button variant="ghost" className="flex-1" asChild>
                <Link href="/knowledge/contribute">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Knowledge
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <PostDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
