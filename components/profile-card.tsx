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
      <Avatar className="h-20 w-20 mb-3">
        <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
        <AvatarFallback>{profile.full_name?.split(" ").map((n) => n[0]).join("") || "U"}</AvatarFallback>
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