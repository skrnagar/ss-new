/**
 * Debug endpoint to check admin setup
 * Remove this in production!
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { hashPassword } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check if table exists
    const { data: users, error: usersError } = await supabase
      .from("admin_users")
      .select("id, email, full_name, role, is_active")
      .limit(5);

    const { data: sessions, error: sessionsError } = await supabase
      .from("admin_sessions")
      .select("id, admin_user_id, expires_at")
      .limit(5);

    return NextResponse.json({
      admin_users_table_exists: !usersError,
      admin_users_error: usersError?.message || null,
      admin_users_count: users?.length || 0,
      admin_users: users || [],
      admin_sessions_table_exists: !sessionsError,
      admin_sessions_error: sessionsError?.message || null,
      admin_sessions_count: sessions?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, action } = body;

    if (action === "create") {
      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 }
        );
      }

      console.log("Creating admin user with email:", email);
      // Use admin client to bypass RLS
      const supabase = createAdminClient();
      
      try {
        const passwordHash = await hashPassword(password);
        console.log("Password hash generated, length:", passwordHash.length);
        const fullName = body.full_name || "Administrator";

      // Check if exists
      const { data: existing } = await supabase
        .from("admin_users")
        .select("id")
        .eq("email", email.toLowerCase())
        .single();

      if (existing) {
        // Update
        const { data, error } = await supabase
          .from("admin_users")
          .update({
            password_hash: passwordHash,
            full_name: fullName,
            is_active: true,
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({
          success: true,
          message: "Admin user updated",
          user: { id: data.id, email: data.email, full_name: data.full_name },
        });
      } else {
        // Create
        const { data, error } = await supabase
          .from("admin_users")
          .insert({
            email: email.toLowerCase(),
            password_hash: passwordHash,
            full_name: fullName,
            role: "admin",
            is_active: true,
            is_approved: false, // New admins need approval
          })
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({
          success: true,
          message: "Admin user created",
          user: { id: data.id, email: data.email, full_name: data.full_name },
        });
      }
      } catch (hashError: any) {
        console.error("Error hashing password:", hashError);
        return NextResponse.json(
          { error: `Failed to hash password: ${hashError.message}` },
          { status: 500 }
        );
      }
    }

    if (action === "hash") {
      if (!password) {
        return NextResponse.json({ error: "Password is required" }, { status: 400 });
      }
      const hash = await hashPassword(password);
      return NextResponse.json({ password, hash });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      { error: error.message, stack: process.env.NODE_ENV === "development" ? error.stack : undefined },
      { status: 500 }
    );
  }
}

