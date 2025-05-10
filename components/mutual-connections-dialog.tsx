
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

interface MutualConnectionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connections: any[];
}

export function MutualConnectionsDialog({
  open,
  onOpenChange,
  connections
}: MutualConnectionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mutual Connections</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {connections.map((connection) => (
            <div
              key={connection.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={connection.profile.avatar_url} />
                  <AvatarFallback>
                    {connection.profile.full_name?.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link
                    href={`/profile/${connection.profile.username}`}
                    className="font-medium hover:underline"
                  >
                    {connection.profile.full_name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {connection.profile.headline}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/profile/${connection.profile.username}`}>
                  View Profile
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
