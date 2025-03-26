
"use client";

import { Calendar, Search, Users } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "./ui/card";

export function FeedSidebar() {
  return (
    <Card className="h-fit sticky top-20">
      <CardContent className="pt-6">
        <nav className="space-y-4">
          <Link 
            href="/network" 
            className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
          >
            <Users className="h-5 w-5 text-primary" />
            <div>
              <div className="font-medium">My Connections</div>
              <p className="text-sm text-muted-foreground">Manage your professional network</p>
            </div>
          </Link>
          
          <Link 
            href="/network/professionals" 
            className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
          >
            <Search className="h-5 w-5 text-primary" />
            <div>
              <div className="font-medium">Explore People</div>
              <p className="text-sm text-muted-foreground">Find ESG & EHS professionals</p>
            </div>
          </Link>
          
          <Link 
            href="/groups" 
            className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
          >
            <Users className="h-5 w-5 text-primary" />
            <div>
              <div className="font-medium">Groups</div>
              <p className="text-sm text-muted-foreground">Join specialized professional groups</p>
            </div>
          </Link>
          
          <Link 
            href="/events" 
            className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
          >
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <div className="font-medium">Events</div>
              <p className="text-sm text-muted-foreground">Discover industry events and conferences</p>
            </div>
          </Link>
        </nav>
      </CardContent>
    </Card>
  );
}
