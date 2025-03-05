
import { SupabaseClient } from '@supabase/supabase-js'

// This function checks if the required tables exist in the database
export async function verifyDatabaseSetup(supabase: SupabaseClient) {
  const requiredTables = [
    'profiles',
    'posts',
    'comments',
    'likes',
    'follows',
    'jobs',
    'applications',
    'groups',
    'group_members'
  ]
  
  console.log("Checking required tables:", requiredTables)
  
  const foundTables: string[] = []
  const missingTables: string[] = []
  let hasError = false

  try {
    // First try to use system tables if permissions allow
    const { data: systemTables, error: systemError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (!systemError && systemTables) {
      console.log("Found tables using system query:", systemTables)
      const tableNames = systemTables.map(t => t.table_name)
      
      for (const table of requiredTables) {
        if (tableNames.includes(table)) {
          foundTables.push(table)
        } else {
          missingTables.push(table)
        }
      }
      
      if (missingTables.length > 0) {
        hasError = true
        console.error("Missing tables:", missingTables)
      }
      
      return { 
        tables: foundTables,
        error: hasError ? { message: 'Missing required tables', missingTables } : null
      }
    }
    
    // Fallback: check each table individually
    console.log("Checking tables individually")
    
    for (const table of requiredTables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1)
        
        if (error) {
          console.error(`Table ${table} check failed:`, error)
          missingTables.push(table)
        } else {
          console.log(`Table ${table} exists`)
          foundTables.push(table)
        }
      } catch (err) {
        console.error(`Error checking table ${table}:`, err)
        missingTables.push(table)
      }
    }
    
    if (missingTables.length > 0) {
      hasError = true
      console.error("Missing tables after individual checks:", missingTables)
    }
    
    return { 
      tables: foundTables,
      error: hasError ? { message: 'Missing required tables', missingTables } : null
    }
  } catch (error) {
    console.error("Error verifying database:", error)
    return { 
      error,
      tables: foundTables
    }
  }
}
