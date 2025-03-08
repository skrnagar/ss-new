
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

const migrateDatabase = async () => {
  try {
    console.log('Running events schema migration...')
    
    const sqlPath = path.join(process.cwd(), 'lib', 'events-schema.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    const { error } = await supabase.rpc('exec_sql', { sql_string: sql })
    
    if (error) {
      console.error('Migration error:', error)
      process.exit(1)
    }
    
    console.log('Events schema migration completed successfully!')
  } catch (error) {
    console.error('Unexpected error during migration:', error)
    process.exit(1)
  }
}

migrateDatabase()
