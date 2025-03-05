
import { createClient } from '@supabase/supabase-js'

// Create a test client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function testTables() {
  console.log('Testing tables in Supabase...')
  
  try {
    // Try to fetch from profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (profilesError) {
      console.error('Profiles table error:', profilesError)
    } else {
      console.log('Profiles table exists:', profiles)
    }
    
    // List all tables in the public schema
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables')
      .catch(() => ({ data: null, error: { message: 'get_tables RPC not available' } }))
    
    if (tablesError) {
      console.error('Could not list tables:', tablesError)
      
      // Fallback: check specific tables manually
      console.log('Checking individual tables...')
      const tableNames = ['profiles', 'posts', 'comments', 'likes', 'follows', 'jobs', 'applications', 'groups', 'group_members']
      
      for (const table of tableNames) {
        const { error } = await supabase.from(table).select('count').limit(1)
        console.log(`Table ${table}: ${error ? 'Not found or error' : 'Exists'}`)
      }
    } else {
      console.log('Available tables:', tables)
    }
  } catch (err) {
    console.error('General error testing tables:', err)
  }
}

testTables()
