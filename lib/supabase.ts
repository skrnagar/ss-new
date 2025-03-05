import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a client for browser-side or server-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Function to execute SQL directly for database setup
export async function executeSql(sql: string) {
  try {
    // Try using RPC first
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('Error executing SQL via RPC:', error);
      // Fall back to REST API for direct SQL
      // Note: this may not work with the anon key
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('SQL execution error:', error);
    return { data: null, error };
  }
}

// Create basic profiles table
export async function createBasicTables() {
  const basicProfilesTable = `
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      username TEXT UNIQUE NOT NULL,
      full_name TEXT,
      headline TEXT,
      bio TEXT,
      avatar_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  return executeSql(basicProfilesTable);
}

// Utility function to check database health (modified to use direct SQL)
export const checkDatabaseHealth = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count(*)').limit(1);
    if (error) {
      console.error('Database health check failed:', error.message);
      return { healthy: false, error: error.message, statusCode: error.code };
    }
    return { healthy: true, count: data?.[0]?.count || 0 };
  } catch (err: any) {
    console.error('Database connection error:', err.message);
    return { healthy: false, error: err.message };
  }
};