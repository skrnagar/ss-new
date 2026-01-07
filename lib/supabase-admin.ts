import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Creates a Supabase client with service role key
 * This bypasses RLS and should only be used for admin operations
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing");
  }

  // If service role key is available, use it (bypasses RLS)
  if (serviceRoleKey) {
    return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  // Fallback to anon key (will respect RLS)
  // Note: This will fail if RLS policies don't allow the operation
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!anonKey) {
    throw new Error("Supabase keys are missing");
  }

  console.warn("⚠️ Using anon key for admin operations. RLS policies must allow all operations.");
  console.warn("⚠️ For production, set SUPABASE_SERVICE_ROLE_KEY in .env.local");
  
  return createSupabaseClient<Database>(supabaseUrl, anonKey);
}

