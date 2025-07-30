"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, PlusSquare, BookOpen, MessageSquare } from "lucide-react";
import { MobileChat } from "./mobile-chat";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";

const navItems = [
  { href: "/feed", icon: Home, label: "Home" },
  { href: "/network", icon: Users, label: "Network" },
  { href: "/posts/create", icon: PlusSquare, label: "Post" },
  { href: "/knowledge", icon: BookOpen, label: "Knowledge" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { session } = useAuth();
  const user = session?.user;

  useEffect(() => {
    if (!user?.id) return;
    let ignore = false;
    async function fetchUnread() {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from("conversation_participants")
        .select(`conversation:conversations!inner(id, messages(seen, sender_id))`)
        .eq("profile_id", user.id);
      if (!ignore && data) {
        let count = 0;
        data.forEach((item: any) => {
          const messages = item.conversation?.messages || [];
          count += messages.filter((m: any) => !m.seen && m.sender_id !== user.id).length;
        });
        setUnreadCount(count);
      }
    }
    fetchUnread();
    // Subscribe to real-time updates
    const channel = supabase
      .channel('mobile_messages_badge')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchUnread)
      .subscribe();
    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleMessagesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsChatOpen(true);
  };

  return (
    <>
      <nav className="bg-white fixed bottom-0 w-full border-t md:hidden">
        <ul className="flex justify-around p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex flex-col items-center w-16 ${
                    isActive ? "text-primary" : "text-gray-500"
                  } hover:text-primary transition-colors`}
                >
                  <item.icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              </li>
            );
          })}
          {/* Messages button with notification badge */}
          <li>
            <button
              onClick={handleMessagesClick}
              className={`flex flex-col items-center w-16 relative ${
                isChatOpen ? "text-primary" : "text-gray-500"
              } hover:text-primary transition-colors`}
            >
              <div className="relative">
                <MessageSquare className="w-5 h-5 mb-1" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5 flex items-center justify-center min-w-[20px] min-h-[20px]">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="text-xs">Messages</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Mobile Chat Panel */}
      <MobileChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}