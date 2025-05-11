"use client";

import { ChatList } from "@/components/chat/chat-list";
import { useSearchParams } from "next/navigation";

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  return (
    <div className="container flex h-[calc(100vh-4rem)] gap-6 py-6">
      <div className="flex-1 overflow-auto">
        <ChatList initialUserId={userId} />
      </div>
    </div>
  );
}