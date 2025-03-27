
"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, Users, PlusSquare, BookOpen, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    {
      label: "Home",
      href: "/feed",
      icon: Home
    },
    {
      label: "Network",
      href: "/network",
      icon: Users
    },
    {
      label: "Post",
      href: "/posts/create",
      icon: PlusSquare
    },
    {
      label: "Knowledge",
      href: "/knowledge",
      icon: BookOpen
    },
    {
      label: "Learning",
      href: "/learning",
      icon: GraduationCap
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t md:hidden">
      <div className="grid h-full grid-cols-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex flex-col items-center justify-center",
                isActive && "text-primary"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
