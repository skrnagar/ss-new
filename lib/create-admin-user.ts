/**
 * Script to create an admin user
 * 
 * Usage:
 * 1. Update the email and password below
 * 2. Run: npx tsx lib/create-admin-user.ts
 * 
 * Or use this in a one-off script/API route
 */

import { createClient } from "./supabase-server";
import { hashPassword } from "./admin-auth";

async function createAdminUser() {
  const email = "admin@safetyshaper.com"; // Change this
  const password = "admin123"; // Change this to a secure password
  const fullName = "System Administrator";
  const role = "super_admin";

  try {
    const supabase = createClient();
    
    // Hash the password
    const passwordHash = await hashPassword(password);
    
    // Check if admin already exists
    const { data: existing } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      console.log("Admin user already exists. Updating password...");
      const { error: updateError } = await supabase
        .from("admin_users")
        .update({
          password_hash: passwordHash,
          full_name: fullName,
          role: role,
          is_active: true,
        })
        .eq("id", existing.id);

      if (updateError) {
        throw updateError;
      }
      console.log("✅ Admin user updated successfully!");
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
    } else {
      // Create new admin user
      const { data, error } = await supabase
        .from("admin_users")
        .insert({
          email: email.toLowerCase(),
          password_hash: passwordHash,
          full_name: fullName,
          role: role,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log("✅ Admin user created successfully!");
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      console.log(`ID: ${data.id}`);
    }
  } catch (error: any) {
    console.error("❌ Error creating admin user:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createAdminUser();
}

export { createAdminUser };

