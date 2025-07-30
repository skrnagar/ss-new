"use client";

import { ChatInterface } from "./chat/chat-interface";

interface MobileChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileChat({ isOpen, onClose }: MobileChatProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white md:hidden">
      <ChatInterface onBack={onClose} showBackButton={true} />
    </div>
  );
} 