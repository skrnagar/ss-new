
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { PostDialog } from "./post-dialog";

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
      <Card className="md:rounded-lg rounded-none border-x-0 md:border-x">
        <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
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
        </CardContent>
      </Card>
      <PostDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
