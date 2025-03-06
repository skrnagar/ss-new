
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

// This function creates a Supabase client that's safe to use in Client Components
export function createClient() {
  return createClientComponentClient<Database>()
}

// For compatibility with other parts of the codebase
export const createClientLegacyClient = createClient
