
import { supabase } from "./supabase"
import fs from 'fs'
import path from 'path'

async function runAvatarRLSPolicy() {
  try {
    const sqlFilePath = path.join(process.cwd(), 'lib', 'avatar-rls-policy.sql')
    const sqlQuery = fs.readFileSync(sqlFilePath, 'utf8')
    
    const { error } = await supabase.rpc('exec_sql', { sql_query: sqlQuery })
    
    if (error) {
      console.error("Error running avatar RLS policy:", error)
      return
    }
    
    console.log("Avatar RLS policy update completed successfully.")
  } catch (error) {
    console.error("Failed to run avatar RLS policy:", error)
  }
}

runAvatarRLSPolicy()
