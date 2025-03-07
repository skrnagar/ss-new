
import fs from 'fs'
import { supabase } from "./supabase"

async function runActivitiesSchema() {
  try {
    const sql = fs.readFileSync('./lib/activities-schema.sql', 'utf8')
    
    console.log('Running activities schema...')
    
    const { error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error('Error running activities schema:', error)
      return
    }
    
    console.log('Activities schema successfully applied!')
  } catch (error) {
    console.error('Error:', error)
  }
}

runActivitiesSchema()
