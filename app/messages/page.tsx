"use client";

import { ChatList } from "@/components/chat/chat-list";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ProfileCard } from "@/components/profile-card";
import { useAuth } from "@/contexts/auth-context";
import { Users, MessageCircle, Plus } from "lucide-react";
import Link from "next/link";

export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesPageContent />
    </Suspense>
  );
}

function MessagesPageContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const { profile } = useAuth();

  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-5rem)]">
        {/* Main Content: Unified Chat Box */}
        <div className="col-span-1 lg:col-span-9 h-full flex flex-col min-h-0">
          <div className="flex h-full bg-white border rounded-xl shadow overflow-hidden flex-col lg:flex-row">
            <ChatList initialUserId={userId} />
          </div>
        </div>
        {/* Sidebar: Profile, Navigation, Suggestions on the right (outside the box) */}
        <div className="col-span-3 hidden lg:block space-y-6 h-full overflow-y-auto">
          {profile && <ProfileCard profile={profile} />}
          <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-col gap-2">
            <Link href="/network" className="flex items-center gap-3 hover:text-primary">
              <Users className="h-5 w-5" />
              <span className="font-medium">My Connections</span>
            </Link>
            <Link href="/messages" className="flex items-center gap-3 hover:text-primary">
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">Inbox</span>
            </Link>
            <Link href="/messages/new" className="flex items-center gap-3 hover:text-primary">
              <Plus className="h-5 w-5" />
              <span className="font-medium">New Message</span>
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col items-center text-center">
            <h3 className="font-semibold mb-2">Start a new conversation</h3>
            <p className="text-sm text-muted-foreground mb-4">Connect with professionals and grow your network.</p>
            <Link href="/network" className="w-full">
              <span className="block w-full bg-primary text-white rounded-md py-2 font-semibold hover:bg-primary/90 transition text-center cursor-pointer">Find People</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
