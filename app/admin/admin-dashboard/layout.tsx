"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useAdmin } from "@/contexts/admin-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { admin, isLoading } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const isSetupPage = pathname === "/admin/setup";

  useEffect(() => {
    // Don't redirect if we're on the login or setup page
    if (!isLoading && !admin && !isLoginPage && !isSetupPage) {
      router.push("/admin/login");
    }
    // If logged in and on login page, redirect to dashboard
    if (!isLoading && admin && isLoginPage) {
      router.push("/admin/admin-dashboard");
    }
    // If logged in and on setup page, redirect to dashboard
    if (!isLoading && admin && isSetupPage) {
      router.push("/admin/admin-dashboard");
    }
  }, [admin, isLoading, router, isLoginPage, isSetupPage]);

  // Show login and setup pages without sidebar
  if (isLoginPage || isSetupPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-6">
        {children}
      </main>
    </div>
  );
}

