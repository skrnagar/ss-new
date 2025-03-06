// CLIENT-SIDE METHODS - Only for use in Client Components

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or key in environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Utility function to check database health (moved here for client-side use)
export const checkDatabaseHealth = async () => {
  try {
    // Try to access the profiles table
    const { data, error } = await supabase
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