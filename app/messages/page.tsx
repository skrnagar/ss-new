
"use client";

import { ChatList } from "@/components/chat/chat-list";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

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

  return (
    <div className="h-[calc(100vh-4rem)]">
      <ChatList initialUserId={userId} />
    </div>
  );
}
