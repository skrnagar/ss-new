
import { supabase } from "./supabase"
import fs from 'fs'
import path from 'path'

async function runAvatarSchema() {
  try {
    const sqlFilePath = path.join(process.cwd(), 'lib', 'avatar-schema.sql')
    const sqlQuery = fs.readFileSync(sqlFilePath, 'utf8')
    
    const { error } = await supabase.rpc('exec_sql', { sql_query: sqlQuery })
    
    if (error) {
      console.error("Error running avatar schema:", error)
      return
    }
    
    console.log("Avatar schema update completed successfully.")
  } catch (error) {
    console.error("Failed to run avatar schema:", error)
  }
}

runAvatarSchema()
