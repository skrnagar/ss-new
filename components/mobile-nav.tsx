
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
      href: "/posts/create",
      icon: PlusSquare,
      isActive: (path: string) => path.startsWith("/posts/create")
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
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t md:hidden">
      <div className="grid h-full grid-cols-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive(pathname);
          
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex flex-col items-center justify-center",
                isActive ? "text-primary" : "text-gray-500 hover:text-primary"
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
