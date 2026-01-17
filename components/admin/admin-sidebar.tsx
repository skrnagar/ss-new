"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  Building,
  BookOpen,
  Activity,
  BarChart3,
  Settings,
  MessageSquare,
  Calendar,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Admin Users", href: "/admin/admin-users", icon: Users, superAdminOnly: true },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Posts", href: "/admin/posts", icon: FileText },
  { name: "Jobs", href: "/admin/jobs", icon: Briefcase },
  { name: "Companies", href: "/admin/companies", icon: Building },
  { name: "Articles", href: "/admin/articles", icon: BookOpen },
  { name: "Events", href: "/admin/events", icon: Calendar },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Activity Log", href: "/admin/activity", icon: Activity },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-card">
      <nav className="flex flex-col gap-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

