"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/contexts/admin-context";
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
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, badge: null },
  { name: "Admin Users", href: "/admin/admin-users", icon: Shield, superAdminOnly: true, badge: null },
  { name: "Users", href: "/admin/users", icon: Users, badge: null },
  { name: "Posts", href: "/admin/posts", icon: FileText, badge: null },
  { name: "Jobs", href: "/admin/jobs", icon: Briefcase, badge: null },
  { name: "Companies", href: "/admin/companies", icon: Building, badge: null },
  { name: "Articles", href: "/admin/articles", icon: BookOpen, badge: null },
  { name: "Events", href: "/admin/events", icon: Calendar, badge: null },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare, badge: null },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3, badge: null },
  { name: "Activity Log", href: "/admin/activity", icon: Activity, badge: null },
  { name: "Settings", href: "/admin/settings", icon: Settings, badge: null },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { admin } = useAdmin();
  const isSuperAdmin = admin?.role === "super_admin";

  // Filter navigation based on role
  const filteredNavigation = navigation.filter(
    (item) => !item.superAdminOnly || isSuperAdmin
  );

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-card overflow-y-auto flex flex-col">
      <nav className="flex flex-col gap-1 p-4 flex-1">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon 
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isActive ? "scale-110" : "group-hover:scale-105"
                )} 
              />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <Badge variant={isActive ? "secondary" : "outline"} className="ml-auto">
                  {item.badge}
                </Badge>
              )}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer info - positioned at bottom but within scroll */}
      <div className="mt-auto p-4 border-t bg-muted/30">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          <span className="flex-1">Admin Portal v1.0</span>
        </div>
        {admin && (
          <div className="mt-2 text-xs text-muted-foreground">
            Logged in as <span className="font-medium capitalize">{admin.role}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
