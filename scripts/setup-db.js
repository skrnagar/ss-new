
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: '.env.local' })

async function setupDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or key in environment variables')
    process.exit(1)
  }
  
  console.log('Creating Supabase client with URL:', supabaseUrl)
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  try {
    console.log('Reading SQL schema...')
    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'lib', 'database.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Split statements by ';' and filter out empty ones
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)
    
    console.log(`Executing ${statements.length} SQL statements...`)
    
    // Create exec_sql function if it doesn't exist
    try {
      await supabase.rpc('exec_sql', { sql: 'SELECT 1' })
      console.log('exec_sql function exists')
    } catch (err) {
      console.log('Creating exec_sql function...')
      // Create a function to execute raw SQL (only works with admin key)
      const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION exec_sql(sql text)
        RETURNS JSONB
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql;
          RETURN jsonb_build_object('success', true);
        EXCEPTION WHEN OTHERS THEN
          RETURN jsonb_build_object(
            'success', false,
            'error', jsonb_build_object(
              'message', SQLERRM,
              'detail', SQLSTATE
            )
          );
        END;
        $$;
      `
      
      try {
        const { error } = await supabase.from('_exec_sql_setup').select('*').limit(1)
        if (error && error.code === '42P01') {
          console.log('Creating exec_sql function using direct SQL access...')
          // Execute direct SQL to create the function
          // Note: This requires admin privileges
          // This might not work depending on your Supabase permissions
        }
      } catch (setupErr) {
        console.error('Error setting up exec_sql function:', setupErr)
      }
    }
    
    // Execute statements one by one
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      console.log(`Executing statement ${i + 1}/${statements.length}...`)
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error)
        }
      } catch (err) {
        console.error(`Error executing statement ${i + 1}:`, err)
      }
    }
    
    console.log('Database setup completed!')
    
    // Test if tables were created
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    if (error) {
      console.log('Profiles table verification error:', error)
    } else {
      console.log('Profiles table verified:', data)
    }
    
  } catch (err) {
    console.error('Error setting up database:', err)
    process.exit(1)
  }
}

setupDatabase()
