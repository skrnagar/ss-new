
"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, Users, PlusSquare, BookOpen, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import { PostDialog } from "./post-dialog";

export function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [postDialogOpen, setPostDialogOpen] = useState(false);

  const handlePostClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setPostDialogOpen(true);
  };

  const navItems = [
    {
      label: "Home",
      href: "/feed",
      icon: Home,
      isActive: (path: string) => path === "/feed"
    },
    {
      label: "Network",
      href: "/network",
      icon: Users,
      isActive: (path: string) => path.startsWith("/network")
    },
    {
      label: "Post",
      href: "#",
      icon: PlusSquare,
      isActive: (path: string) => false
    },
    {
      label: "Knowledge",
      href: "/knowledge",
      icon: BookOpen,
      isActive: (path: string) => path.startsWith("/knowledge")
    },
    {
      label: "Learning",
      href: "/learning",
      icon: GraduationCap,
      isActive: (path: string) => path.startsWith("/learning")
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t">
      <div className="grid h-full grid-cols-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive(pathname);
          
          return item.label === "Post" ? (
            <button
              key={item.label}
              onClick={handlePostClick}
              className="flex flex-col items-center justify-center relative text-gray-500 hover:text-primary"
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center relative",
                isActive ? "text-primary" : "text-gray-500 hover:text-primary"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <PostDialog open={postDialogOpen} onOpenChange={setPostDialogOpen} />
    </div>
  );
}
