
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PostCreator } from "./post-creator";

interface PostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostDialog({ open, onOpenChange }: PostDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create a post</DialogTitle>
          <DialogDescription>
            Share your thoughts with the community
          </DialogDescription>
        </DialogHeader>
        <PostCreator isDialog />
      </DialogContent>
    </Dialog>
  );
}
