import type { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Create a Supabase client for client-side usage
export const supabase = createClientComponentClient<Database>({
  options: {
    global: {
      headers: {
        Accept: "application/json",
      },
    },
  },
});

// Export a function that provides a fresh client instance when needed
export const getSupabaseClient = () =>
  createClientComponentClient<Database>({
    options: {
      global: {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    },
  });

// Utility function to check database health
export const checkDatabaseHealth = async () => {
  const client = createClientComponentClient<Database>();

  try {
    // Try to access the profiles table
    const { data, error } = await client
      .from("profiles")
      .select("count(*)", { count: "exact" })
      .limit(1);

    if (error) {
      console.error("Database health check failed:", error.message);
      return {
        healthy: false,
        error: error.message,
        statusCode: error.code,
      };
    }

    return {
      healthy: true,
      count: data && data[0] && "count" in data[0] ? (data[0].count as number) : 0,
    };
  } catch (err: any) {
    console.error("Database connection error:", err.message);
    return {
      healthy: false,
      error: err.message,
    };
  }
};
