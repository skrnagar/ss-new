import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";
import { safeRedirectPath } from "@/lib/safe-redirect-path";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = safeRedirectPath(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);

    // After the session is set, check for a profile
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();

      // If the user has a profile with a username, redirect to the feed.
      // Otherwise, redirect to the profile setup page.
      if (profile?.username) {
        if (nextPath) {
          return NextResponse.redirect(new URL(nextPath, request.url));
        }
        return NextResponse.redirect(new URL("/feed", request.url));
      }
      return NextResponse.redirect(new URL("/profile/setup", request.url));
    }
  }

  // If there's no code or something goes wrong, redirect to an error page
  return NextResponse.redirect(new URL("/auth/login?error=true", request.url));
} 