"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";

export function ConditionalFooter() {
  const pathname = usePathname();

  // Pages where footer should be displayed
  const footerPages = [
    "/", // Home page
    "/articles",
    "/articles/create",
    "/knowledge",
    "/knowledge/contribute",
    "/learning",
    "/compliance",
    "/jobs",
    "/events",
    "/groups",
  ];

  // Check if current page should show footer
  const shouldShowFooter = footerPages.some(page => 
    pathname === page || pathname.startsWith(page + "/")
  );

  // Don't render footer if not on allowed pages
  if (!shouldShowFooter) {
    return null;
  }

  return <Footer />;
} 