
"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, Users, PlusSquare, Bell, Briefcase } from "lucide-react";
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
      label: "My Network",
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
      label: "Notifications",
      href: "/notifications",
      icon: Bell,
      badge: 2,
      isActive: (path: string) => path === "/notifications"
    },
    {
      label: "Jobs",
      href: "/jobs",
      icon: Briefcase,
      isActive: (path: string) => path.startsWith("/jobs")
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
                "flex flex-col items-center justify-center relative",
                isActive ? "text-primary" : "text-gray-500 hover:text-primary"
              )}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
