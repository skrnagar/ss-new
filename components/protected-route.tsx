"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FullScreenLoader } from "@/components/ui/logo-loder";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, isLoading } = useAuth();
  const user = session?.user;
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [isLoading, user, router]);

  // Show loading indicator
  if (isLoading) {
    return <FullScreenLoader variant="morph" text="Authenticating..." />;
  }

  // If there's a user and not loading, render children
  return user ? <>{children}</> : null;
}
