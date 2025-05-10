"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, Users, PlusSquare, BookOpen, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function MobileNav() {
  const pathname = usePathname();

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
      isActive: () => false,
      onClick: () => {
        const createPostEvent = new CustomEvent('openPostDialog');
        window.dispatchEvent(createPostEvent);
        return false;
      }
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
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t shadow-sm">
      <div className="max-w-md mx-auto h-full">
        <div className="grid h-full grid-cols-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.isActive(pathname);

            return (
              <button
                key={item.href}
                onClick={item.onClick || (() => {})}
                className={cn(
                  "flex flex-col items-center justify-center relative transition-colors w-full",
                  isActive 
                    ? "text-primary font-medium" 
                    : "text-gray-500 hover:text-primary"
                )}
              >
                <Icon className="w-6 h-6 mb-0.5" />
                <span className="text-xs">{item.label}</span>
                {isActive && (
                  <span className="absolute -top-0.5 left-1/2 w-1 h-1 bg-primary rounded-full transform -translate-x-1/2" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}