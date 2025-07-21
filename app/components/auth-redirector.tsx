"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/**
 * This component handles the case where an OAuth provider redirects to a page
 * other than the dedicated callback handler. It detects the presence of a `code`
 * in the URL search params and forwards it to the correct `/auth/callback` route
 * to be exchanged for a session.
 */
export default function AuthRedirector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const next = searchParams.get("next"); // Supabase might use 'next'

    if (code) {
      const redirectPath = `/auth/callback?code=${code}${next ? `&next=${next}` : ""}`;
      router.replace(redirectPath);
    }
  }, [searchParams, router]);

  return null; // This component does not render anything.
} 