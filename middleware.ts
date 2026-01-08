import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";

// List of routes that require authentication
const protectedRoutes = [
  "/feed",
  "/profile",
  "/jobs",
  "/groups",
  "/knowledge",
  "/messages",
  "/notifications",
  "/network",
  "/network/connections",
  "/network/followers",
  "/network/following",
  "/chat",
  "/posts/create",
  "/articles/create",
];

// Routes that should redirect to feed if already authenticated
const authRoutes = ["/auth/login", "/auth/register", "/"];

export async function middleware(request: NextRequest) {
  // Create a response to modify
  const res = NextResponse.next();

  const url = new URL(request.url);
  const path = url.pathname;

  // Handle admin routes separately - skip Supabase auth entirely
  // All admin routes are under /admin/
  if (path.startsWith("/admin") || path.startsWith("/api/admin/")) {
    // Allow login page, setup page, and API routes to pass through
    if (
      path === "/admin/login" ||
      path === "/admin/setup" ||
      path.startsWith("/api/admin/auth/login") ||
      path.startsWith("/api/admin/debug") ||
      path.startsWith("/api/admin/create-user")
    ) {
      return res;
    }

    // Check admin authentication for other admin routes
    const session = await getAdminSessionFromRequest(request);
    // If is_approved is null/undefined, treat super_admin as approved (for existing users)
    const isApproved = session?.admin_user?.is_approved ?? (session?.admin_user?.role === "super_admin");
    
    if (!session || !session.admin_user || !session.admin_user.is_active || !isApproved) {
      // Only redirect if it's not already the login page
      if (path !== "/admin/login") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }

    return res;
  }

  // Create a Supabase client specifically for the middleware
  const supabase = createMiddlewareClient({ req: request, res });

  // Get the session using the supabase middleware client
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const isAuthenticated = !!session;

    // Skip middleware for static assets and system paths - faster early returns
    if (
      path.startsWith("/auth/callback") ||
      path.includes("/_next") ||
      path.includes("/api/admin/") || // Skip admin API routes (already handled above)
      path.startsWith("/_vercel") ||
      path.endsWith(".svg") ||
      path.endsWith(".jpg") ||
      path.endsWith(".png") ||
      path.endsWith(".webp") ||
      path.endsWith(".mp4") ||
      path.endsWith(".ico") ||
      path.endsWith(".js") ||
      path.endsWith(".css")
    ) {
      return res;
    }

    // Check if the route is protected and user is not authenticated
    const isProtectedRoute = protectedRoutes.some(
      (route) => path === route || path.startsWith(`${route}/`)
    );

    if (isProtectedRoute && !isAuthenticated) {
      // Store the original URL to redirect back after login
      const redirectUrl = new URL("/auth/login", request.url);
      redirectUrl.searchParams.set("redirectUrl", url.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Special handling for chat-related routes
    if ((path.startsWith("/chat") || path.startsWith("/messages")) && !isAuthenticated) {
      const redirectUrl = new URL("/auth/login", request.url);
      redirectUrl.searchParams.set("redirectUrl", url.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // New logic: Check for profile completeness if the user is authenticated
    if (isAuthenticated && path !== "/profile/setup" && !path.startsWith("/api/")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", session.user.id)
        .single();

      // If profile is missing or username is not set, redirect to setup
      if (!profile || !profile.username) {
        return NextResponse.redirect(new URL("/profile/setup", request.url));
      }
    }

    // Check if the user is accessing auth routes while already authenticated
    const isAuthRoute = authRoutes.some((route) => path === route || path.startsWith(`${route}/`));

    if (isAuthRoute && isAuthenticated) {
      // Redirect authenticated users trying to access auth pages to feed
      return NextResponse.redirect(new URL("/feed", request.url));
    }

    return res;
  } catch (error) {
    console.error("Middleware auth error:", error);
    // If there's an error with auth, let the request through and let client-side handle auth
    return res;
  }
}

export const config = {
  matcher: [
    // Match all routes except static files and api routes
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
