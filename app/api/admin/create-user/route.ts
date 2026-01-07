/**
 * One-time API route to create an admin user
 * 
 * WARNING: Remove or secure this route after creating your admin user!
 * 
 * Usage: POST /api/admin/create-user
 * Body: { email: "admin@example.com", password: "secure-password", full_name: "Admin Name" }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { hashPassword } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Add a secret key check here in production
    const secret = request.headers.get("x-admin-secret");
    if (secret !== process.env.ADMIN_CREATE_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, password, full_name = "Administrator", role = "super_admin" } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const passwordHash = await hashPassword(password);

    // Check if admin already exists
    const { data: existing } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      // Update existing admin
      const { error: updateError } = await supabase
        .from("admin_users")
        .update({
          password_hash: passwordHash,
          full_name,
          role,
          is_active: true,
        })
        .eq("id", existing.id);

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({
        success: true,
        message: "Admin user updated",
        id: existing.id,
      });
    } else {
      // Create new admin
      const { data, error } = await supabase
        .from("admin_users")
        .insert({
          email: email.toLowerCase(),
          password_hash: passwordHash,
          full_name,
          role,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
        message: "Admin user created",
        id: data.id,
      });
    }
  } catch (error: any) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create admin user" },
      { status: 500 }
    );
  }
}

