import { AvatarUpload } from "@/app/components/avatar-upload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UserActivity } from "@/components/user-activity";
import { createLegacyClient } from "@/lib/supabase-server";
import { Briefcase, Calendar, Edit, MapPin, MessageSquare, User, UserPlus, Linkedin, Twitter, Globe, BadgeCheck, Users, FileText } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ConnectButton } from "@/components/connect-button";
import { FollowButton } from "@/components/follow-button";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

export const revalidate = 3600; // Revalidate the data at most every hour

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const { username } = params;
  const supabase = createLegacyClient();

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get profile by username
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !profile) {
    // Profile not found
    return notFound();
  }

  // Fetch connections count
  const { count: connectionsCount, error: connectionsError } = await supabase
    .from("connections")
    .select("id", { count: "exact" })
    .or(`user_id.eq.${profile.id},connected_user_id.eq.${profile.id}`)
    .eq("status", "accepted");

  // Fetch followers count
  const { count: followersCount, error: followersError } = await supabase
    .from("follows")
    .select("follower_id", { count: "exact" })
    .eq("following_id", profile.id);

  // Fetch posts count
  const { count: postsCount, error: postsError } = await supabase
    .from("posts")
    .select("id", { count: "exact" })
    .eq("user_id", profile.id);

  // Check if viewing own profile
  const isOwnProfile = session?.user.id === profile.id;

  // Format date for display
  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  // Helper function to get initials
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part?.[0] || "")
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Example social links and stats (replace with real data if available)
  const socialLinks = [
    profile.linkedin && { icon: Linkedin, url: profile.linkedin },
    profile.twitter && { icon: Twitter, url: profile.twitter },
    profile.website && { icon: Globe, url: profile.website },
  ].filter(Boolean);
  
  // For now, use placeholder stats since these columns don't exist yet
  const stats = [
    { icon: Users, label: "Connections", value: connectionsCount || 0 }, 
    { icon: UserPlus, label: "Followers", value: followersCount || 0 },
    { icon: FileText, label: "Posts", value: postsCount || 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col items-center">
                  {/* Avatar with modern ring design */}
                  <div className="mb-6 relative">
                    <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full ring-4 ring-primary/20 flex items-center justify-center shadow-xl overflow-hidden">
                      <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                        {/* @ts-ignore client component */}
                        <div suppressHydrationWarning>
                          <div className="client-only-component">
                            <AvatarUpload
                              userId={profile.id}
                              avatarUrl={profile.avatar_url}
                              name={profile.full_name || username}
                              isOwnProfile={isOwnProfile}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    {profile.verified && (
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg ring-2 ring-white">
                        <BadgeCheck className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </div>
                  
                  {/* Name, Headline, Badges, Social, Stats, Actions */}
                  <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">{profile.full_name}</h2>
                  <p className="text-gray-600 text-center mb-3">{profile.headline}</p>
                  
                  <div className="flex justify-center gap-2 mb-4">
                    {profile.badges?.map((badge: string) => (
                      <Badge key={badge} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex justify-center gap-3 mb-6">
                    {socialLinks.map((link, i) => (
                      <a 
                        key={i} 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-2 rounded-full bg-gray-100 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                      >
                        <link.icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                  
                  <div className="flex justify-center gap-6 mb-6">
                    {stats.map((stat, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <stat.icon className="h-5 w-5 text-primary mb-1" />
                        <span className="font-bold text-lg text-gray-900">{stat.value}</span>
                        <span className="text-xs text-gray-500">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="w-full flex gap-2">
                    {isOwnProfile ? (
                      <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                        <a href="/profile/setup">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </a>
                      </Button>
                    ) : (
                      <>
                        <Button className="flex-1 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                          <Link href={`/messages?userId=${profile.id}`}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </Link>
                        </Button>
                        {session && <ConnectButton userId={session.user.id} profileId={profile.id} />}
                        {!isOwnProfile && session && (
                          <FollowButton userId={session.user.id} profileId={profile.id} />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.company && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Briefcase className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {profile.position ? `${profile.position} at ` : "Works at "}
                        {profile.company}
                      </p>
                    </div>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{profile.location}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">Joined {joinDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">@{profile.username}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Profile Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.bio ? (
                  <p className="whitespace-pre-line text-base leading-relaxed text-gray-700">{profile.bio}</p>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="p-4 bg-gray-100 rounded-full mb-4">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 italic text-center">
                      {isOwnProfile ? "Add a bio to tell others about yourself." : "No bio available."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="client-only-component" suppressHydrationWarning>
                  {/* @ts-ignore */}
                  <UserActivity userId={profile.id} isOwnProfile={isOwnProfile} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
