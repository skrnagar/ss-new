"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { ChatInterface } from "./chat/chat-interface";

export function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Toggle Button - Desktop Only */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 z-50 hidden md:block">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            size="icon"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Desktop Chat Panel - Mobile-like Behavior */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 hidden md:block max-w-[calc(100vw-2rem)]">
          <Card className="w-80 lg:w-96 xl:w-[32rem] max-w-[calc(100vw-2rem)] h-[600px] lg:h-[700px] xl:h-[800px] max-h-[calc(100vh-2rem)] shadow-2xl border-0 rounded-xl overflow-hidden">
            {/* Chat Content - Mobile-like Interface */}
            <CardContent className="p-0 h-full">
              <ChatInterface onBack={() => setIsOpen(false)} />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
} 