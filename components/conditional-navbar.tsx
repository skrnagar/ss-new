"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import Navbar with Suspense
const Navbar = dynamic(
  () => import("@/components/navbar").then((mod) => ({ default: mod.Navbar })),
  {
    ssr: true,
    loading: () => (
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="mr-2 h-9 w-9 bg-muted rounded-md animate-pulse"></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 h-8 bg-muted rounded-md animate-pulse"></div>
          </div>
        </div>
      </header>
    ),
  }
);

export function ConditionalNavbar() {
  const pathname = usePathname();

  // Don't show navbar on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="mr-2 h-9 w-9 bg-muted rounded-md animate-pulse"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 h-8 bg-muted rounded-md animate-pulse"></div>
            </div>
          </div>
        </header>
      }
    >
      <Navbar />
    </Suspense>
  );
}

