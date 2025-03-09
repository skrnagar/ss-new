
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const insertSampleEvents = async () => {
  try {
    console.log('Inserting sample events data...')
    
    const sqlPath = path.join(process.cwd(), 'lib', 'insert-sample-events.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Execute the SQL using RPC
    const { error } = await supabase.rpc('exec_sql', { sql_string: sql })
    
    if (error) {
      console.error('Error inserting sample data:', error)
      process.exit(1)
    }
    
    console.log('Sample events data inserted successfully!')
  } catch (error) {
    console.error('Unexpected error during sample data insertion:', error)
    process.exit(1)
  }
}

insertSampleEvents()
