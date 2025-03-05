
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or key in environment variables');
    process.exit(1);
  }
  
  console.log('Creating Supabase client with URL:', supabaseUrl);
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Create the basic tables directly
    const createProfilesTable = `
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        username TEXT UNIQUE NOT NULL,
        full_name TEXT,
        headline TEXT,
        bio TEXT,
        avatar_url TEXT,
        company TEXT,
        position TEXT,
        location TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    try {
      // Check if table exists using PostgreSQL's information_schema
      console.log('Checking if profiles table exists...');
      const { error: checkError } = await supabase.from('profiles').select('count').limit(1);
      
      if (checkError && checkError.code === '42P01') {
        console.log('Profiles table does not exist, attempting to create it...');
        
        // Try to create the profiles table using REST API
        try {
          // Try direct SQL execution through Supabase REST API
          const { error: sqlError } = await supabase.rpc('exec_sql', { sql: createProfilesTable });
          
          if (sqlError) {
            console.error('Error using RPC exec_sql:', sqlError);
            console.log('Attempting alternative method...');
            
            // Create SQL function if it doesn't exist
            const createSqlFunc = `
              CREATE OR REPLACE FUNCTION exec_sql(sql text) RETURNS void AS $$
              BEGIN
                EXECUTE sql;
              END;
              $$ LANGUAGE plpgsql SECURITY DEFINER;
            `;
            
            // Need to use pg directly for this level of SQL execution
            console.log('Note: You may need to create the exec_sql function in the SQL editor directly');
            console.log('Consider using the Supabase dashboard SQL editor to run this SQL directly:');
            console.log(createProfilesTable);
          } else {
            console.log('Created profiles table using RPC');
          }
        } catch (execErr) {
          console.error('SQL execution error:', execErr);
        }
      } else {
        console.log('Profiles table already exists');
      }
      
      // Verify if table was created successfully
      const { data, error: verifyError } = await supabase.from('profiles').select('count').limit(1);
      
      if (verifyError) {
        console.error('Failed to verify profiles table:', verifyError);
      } else {
        console.log('Profiles table verified successfully');
      }
      
    } catch (err) {
      console.error('Error checking or creating tables:', err);
    }
  } catch (err) {
    console.error('Error setting up database:', err);
    process.exit(1);
  }
}

setupDatabase();
