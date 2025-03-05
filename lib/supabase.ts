import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key in environment variables')
}

// Create a singleton Supabase client for client-side usage
export const supabase = createClientComponentClient<Database>()

// Export a function that provides a fresh client instance when needed
export const getSupabase = () => createClientComponentClient<Database>()

// Utility function to check database health
export const checkDatabaseHealth = async () => {
  const client = createClientComponentClient<Database>()
  
  try {
    // Try to access the profiles table
    const { data, error } = await client
      .from('profiles')
      .select('count(*)', { count: 'exact' })
      .limit(1)
    
    if (error) {
      console.error('Database health check failed:', error.message)
      return {
        healthy: false,
        error: error.message,
        statusCode: error.code
      }
    }
    
    return {
      healthy: true,
      count: data?.[0]?.count || 0
    }
  } catch (err: any) {
    console.error('Database connection error:', err.message)
    return {
      healthy: false,
      error: err.message
    }
  }
}