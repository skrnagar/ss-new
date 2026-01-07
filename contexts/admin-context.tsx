"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

type AdminUser = {
  id: string;
  email: string;
  full_name: string;
  role: string;
};

type AdminContextType = {
  admin: AdminUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
};

const AdminContext = createContext<AdminContextType>({
  admin: null,
  isLoading: true,
  logout: async () => {},
  refreshAdmin: async () => {},
});

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchAdmin = useCallback(async () => {
    // Don't fetch on login or setup pages
    if (pathname === "/admin/login" || pathname === "/admin/setup") {
      setIsLoading(false);
      setAdmin(null);
      return;
    }

    try {
      const response = await fetch("/api/admin/auth/me", {
        credentials: "include", // Important: include cookies
      });
      
      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          setAdmin(data.admin);
        } else {
          // Got HTML instead of JSON - probably a redirect or error
          setAdmin(null);
        }
      } else {
        setAdmin(null);
      }
    } catch (error: any) {
      // Only log errors if not on login/setup pages
      if (pathname !== "/admin/login" && pathname !== "/admin/setup") {
        // Check if it's a JSON parse error (HTML response)
        if (error.message?.includes("Unexpected token")) {
          // Silently handle - probably redirected to login
          setAdmin(null);
        } else {
          console.error("Error fetching admin:", error);
        }
      }
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  }, [pathname]);

  useEffect(() => {
    fetchAdmin();
  }, [fetchAdmin]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      setAdmin(null);
      router.push("/admin/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }, [router]);

  const refreshAdmin = useCallback(async () => {
    await fetchAdmin();
  }, [fetchAdmin]);

  return (
    <AdminContext.Provider value={{ admin, isLoading, logout, refreshAdmin }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);

