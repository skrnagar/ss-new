import { createClient } from "./supabase-server";
import { createAdminClient } from "./supabase-admin";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// Generate a secure token
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Hash password using bcrypt
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password - supports both bcrypt and SHA-256 (for migration)
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    // Check if it's a bcrypt hash (starts with $2a$, $2b$, or $2y$)
    if (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")) {
      const result = await bcrypt.compare(password, hash);
      console.log("Bcrypt comparison result:", result);
      return result;
    }
    
    // Fallback to SHA-256 for legacy hashes
    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
    const result = passwordHash === hash;
    console.log("SHA-256 comparison result:", result);
    return result;
  } catch (error: any) {
    console.error("Error verifying password:", error);
    return false;
  }
}

// Create admin session
export async function createAdminSession(adminUserId: string) {
  const supabase = createAdminClient();
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  const { data, error } = await supabase
    .from("admin_sessions")
    .insert({
      admin_user_id: adminUserId,
      token,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create session: ${error.message}`);
  }

  // Set cookie
  const cookieStore = cookies();
  cookieStore.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return { token, session: data };
}

// Get admin session from token (for use in API routes and server components)
export async function getAdminSession(token?: string) {
  try {
    const supabase = createAdminClient();
    const cookieStore = cookies();
    const sessionToken = token || cookieStore.get("admin_token")?.value;

    if (!sessionToken) {
      return null;
    }

    const { data: session, error } = await supabase
      .from("admin_sessions")
      .select(
        `
        *,
        admin_user:admin_users(*)
      `
      )
      .eq("token", sessionToken)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error || !session) {
      return null;
    }

    // Check if admin user is approved and active
    // If is_approved is null/undefined, treat super_admin as approved (for existing users)
    if (session.admin_user) {
      const isApproved = session.admin_user.is_approved ?? (session.admin_user.role === "super_admin");
      
      if (!isApproved || !session.admin_user.is_active) {
        return null;
      }
    }

    return session;
  } catch (error) {
    console.error("Error getting admin session:", error);
    return null;
  }
}

// Get admin session from request (for use in middleware)
export async function getAdminSessionFromRequest(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;
    if (!token) {
      return null;
    }

    const supabase = createAdminClient();
    const { data: session, error } = await supabase
      .from("admin_sessions")
      .select(
        `
        *,
        admin_user:admin_users(*)
      `
      )
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error || !session) {
      return null;
    }

    // Check if admin user is approved and active
    // If is_approved is null/undefined, treat super_admin as approved (for existing users)
    const isApproved = session.admin_user?.is_approved ?? (session.admin_user?.role === "super_admin");
    
    if (session.admin_user && (!isApproved || !session.admin_user.is_active)) {
      return null;
    }

    return session;
  } catch (error) {
    return null;
  }
}

// Get current admin user
export async function getCurrentAdmin() {
  try {
    const session = await getAdminSession();
    if (!session || !session.admin_user) {
      return null;
    }

    // Check if admin is active and approved
    // If is_approved is null/undefined, treat super_admin as approved (for existing users)
    const isApproved = session.admin_user.is_approved ?? (session.admin_user.role === "super_admin");
    
    if (!session.admin_user.is_active || !isApproved) {
      return null;
    }

    return session.admin_user;
  } catch (error) {
    console.error("Error getting current admin:", error);
    return null;
  }
}

// Delete admin session (logout)
export async function deleteAdminSession(token?: string) {
  const supabase = createAdminClient();
  const cookieStore = cookies();
  const sessionToken = token || cookieStore.get("admin_token")?.value;

  if (sessionToken) {
    await supabase.from("admin_sessions").delete().eq("token", sessionToken);
  }

  cookieStore.delete("admin_token");
}

// Log admin activity
export async function logAdminActivity(
  adminUserId: string,
  action: string,
  resourceType?: string,
  resourceId?: string,
  details?: Record<string, any>
) {
  const supabase = createAdminClient();
  const cookieStore = cookies();
  const ipAddress = cookieStore.get("x-forwarded-for")?.value || "unknown";

  await supabase.from("admin_activity_log").insert({
    admin_user_id: adminUserId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details: details || {},
    ip_address: ipAddress,
  });
}

// Authenticate admin with email and password
export async function authenticateAdmin(email: string, password: string) {
  try {
    const supabase = createAdminClient();

    console.log("Looking for admin user with email:", email.toLowerCase());

    // Get admin user
    const { data: adminUser, error: fetchError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("is_active", true)
      .single();

    if (fetchError) {
      console.error("Error fetching admin user:", fetchError);
      // PGRST116 means no rows found (table exists but no matching user)
      if (fetchError.code === "PGRST116") {
        console.log("No admin user found with that email");
        return { success: false, error: "Invalid email or password" };
      }
      // Check if table doesn't exist
      if (fetchError.message.includes("does not exist") || fetchError.code === "42P01") {
        return {
          success: false,
          error: "Admin users table not found. Please run the database schema first.",
        };
      }
      return { success: false, error: "Invalid email or password" };
    }

    if (!adminUser) {
      console.log("No admin user found with email:", email);
      return { success: false, error: "Invalid email or password" };
    }

    console.log("Admin user found, verifying password...");
    console.log("Password hash from DB:", adminUser.password_hash?.substring(0, 20) + "...");
    console.log("Hash type:", adminUser.password_hash?.startsWith("$2") ? "bcrypt" : "SHA-256");

    // Verify password
    const isValid = await verifyPassword(password, adminUser.password_hash);
    console.log("Password verification result:", isValid);
    if (!isValid) {
      console.log("Password verification failed");
      console.log("Tried password:", password);
      return { success: false, error: "Invalid email or password" };
    }

    console.log("Password verified, creating session...");

    // Update last login
    await supabase
      .from("admin_users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", adminUser.id);

    // Create session
    const session = await createAdminSession(adminUser.id);

    // Log activity
    await logAdminActivity(adminUser.id, "login");

    return {
      success: true,
      admin: {
        id: adminUser.id,
        email: adminUser.email,
        full_name: adminUser.full_name,
        role: adminUser.role,
        is_approved: adminUser.is_approved,
      },
      token: session.token,
    };
  } catch (error: any) {
    console.error("Error in authenticateAdmin:", error);
    return {
      success: false,
      error: error.message || "An error occurred during authentication",
    };
  }
}

