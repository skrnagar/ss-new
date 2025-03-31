"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Calendar, Search, Shield, Users } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { PostCreator } from "@/components/post-creator";
import { PostItem } from "@/components/post-item";
import { supabase } from "@/lib/supabase";

export default function FeedPage() {
  const { activeProfile } = useAuth();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from("posts_with_author")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPosts(data);
      }
    }

    fetchPosts();
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
    <div className="container py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 mb-4">
                    <AvatarImage
                      src={activeProfile?.avatar_url || ""}
                      alt={activeProfile?.full_name || "User"}
                    />
                    <AvatarFallback>{getInitials(activeProfile?.full_name || "")}</AvatarFallback>
                  </Avatar>
                  <h2 className="font-semibold">{activeProfile?.full_name}</h2>
                  <p className="text-sm text-muted-foreground">{activeProfile?.headline}</p>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Menu */}
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <Link href="/network/connections" className="flex items-center gap-3 p-2 hover:bg-muted rounded-md">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">My Connections</div>
                      <p className="text-xs text-muted-foreground">Manage your professional network</p>
                    </div>
                  </Link>

                  <Link href="/network/professionals" className="flex items-center gap-3 p-2 hover:bg-muted rounded-md">
                    <Search className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Explore People</div>
                      <p className="text-xs text-muted-foreground">Find ESG & EHS professionals</p>
                    </div>
                  </Link>

                  <Link href="/groups" className="flex items-center gap-3 p-2 hover:bg-muted rounded-md">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Groups</div>
                      <p className="text-xs text-muted-foreground">Join specialized professional groups</p>
                    </div>
                  </Link>

                  <Link href="/events" className="flex items-center gap-3 p-2 hover:bg-muted rounded-md">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Events</div>
                      <p className="text-xs text-muted-foreground">Discover industry events and conferences</p>
                    </div>
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <PostCreator />
            {posts.map((post: any) => (
              <PostItem key={post.id} post={post} />
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6">
              { /*  This section is a direct copy from the original code's right sidebar */}
              {activeProfile ? (
                <div className="flex flex-col items-center text-center mb-4">
                  <Avatar className="h-16 w-16 mb-3">
                    <AvatarImage
                      src={activeProfile.avatar_url || ""}
                      alt={activeProfile.full_name || "User"}
                    />
                    <AvatarFallback>
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="font-medium">{activeProfile.full_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {activeProfile.headline || "No headline"}
                  </p>

                  <Button
                    className="w-full mt-3"
                    variant="outline"
                    onClick={() => {}} // Placeholder, needs proper routing
                  >
                    View Profile
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-3">
                    Sign in to access your profile and all features
                  </p>
                  <Button onClick={() => {}}>Sign In</Button> {/* Placeholder, needs proper routing */}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Upcoming Events</h3>
              <div className="space-y-3">
                <div className="border rounded-md p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Tomorrow, 3:00 PM</span>
                  </div>
                  <h4 className="font-medium">ESG Reporting Best Practices</h4>
                  <p className="text-sm text-muted-foreground">
                    Join industry experts for a webinar on ESG reporting standards
                  </p>
                </div>

                <div className="border rounded-md p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">May 15, 2:00 PM</span>
                  </div>
                  <h4 className="font-medium">Workplace Safety Forum</h4>
                  <p className="text-sm text-muted-foreground">
                    Virtual panel discussion on improving safety culture
                  </p>
                </div>

                <Button variant="link" className="px-0">
                  See all events
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Suggested Connections</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>JP</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">James Peterson</p>
                      <p className="text-xs text-muted-foreground">
                        Safety Director at Construct Co.
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>MJ</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Maria Johnson</p>
                      <p className="text-xs text-muted-foreground">
                        ESG Analyst at Green Metrics
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>RL</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Robert Lee</p>
                      <p className="text-xs text-muted-foreground">
                        EHS Manager at Industrial Tech
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </div>

                <Button variant="link" className="px-0">
                  See more suggestions
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Network Navigation Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Link href="/network" className="flex items-center gap-3 hover:text-primary">
                  <Users className="h-5 w-5" />
                  <div>
                    <h3 className="font-medium">My Connections</h3>
                    <p className="text-sm text-muted-foreground">Manage your professional network</p>
                  </div>
                </Link>

                <Link href="/network/professionals" className="flex items-center gap-3 hover:text-primary">
                  <Search className="h-5 w-5" />
                  <div>
                    <h3 className="font-medium">Explore People</h3>
                    <p className="text-sm text-muted-foreground">Find ESG & EHS professionals</p>
                  </div>
                </Link>

                <Link href="/groups" className="flex items-center gap-3 hover:text-primary">
                  <Users className="h-5 w-5" />
                  <div>
                    <h3 className="font-medium">Groups</h3>
                    <p className="text-sm text-muted-foreground">Join specialized professional groups</p>
                  </div>
                </Link>

                <Link href="/events" className="flex items-center gap-3 hover:text-primary">
                  <Calendar className="h-5 w-5" />
                  <div>
                    <h3 className="font-medium">Events</h3>
                    <p className="text-sm text-muted-foreground">Discover industry events and conferences</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}