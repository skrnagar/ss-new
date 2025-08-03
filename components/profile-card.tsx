import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import React from "react";

export function ProfileLink({ profile, children, className = "" }: { profile: { username?: string; id?: string; full_name?: string }; children: React.ReactNode; className?: string }) {
  const href = profile?.username ? `/profile/${profile.username}` : profile?.id ? `/profile/${profile.id}` : "#";
  return (
    <Link href={href} className={className} prefetch={false} tabIndex={0} aria-label={profile?.full_name || "User Profile"}>
      {children}
    </Link>
  );
}

export function ProfileCard({ profile }: { profile: { id?: string; username?: string; full_name?: string; avatar_url?: string; headline?: string } }) {
  return (
    <ProfileLink profile={profile} className="block bg-white rounded-xl shadow-sm border p-6 flex flex-col items-center text-center transition hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary cursor-pointer">
      <Avatar className="h-24 w-24 mb-3">
        <div className="h-24 w-24 rounded-full p-1 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
          <div className="h-full w-full rounded-full bg-white p-1">
            <AvatarImage src={profile.avatar_url} alt={profile.full_name} className="object-cover rounded-full" />
            <AvatarFallback className="rounded-full">{profile.full_name?.split(" ").map((n) => n[0]).join("") || "U"}</AvatarFallback>
          </div>
        </div>
      </Avatar>
      <div className="font-bold text-m text-gray-900 hover:text-primary">
        {profile.full_name || "Anonymous User"}
      </div>
      {profile.headline && (
        <div className="text-gray-500 text-xs mt-1 line-clamp-2">{profile.headline}</div>
      )}
    </ProfileLink>
  );
} 