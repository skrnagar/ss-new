
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
    
    // SQL to check if table exists
    const checkTableSQL = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
      );
    `;
    
    try {
      // Check if table exists using PostgreSQL's information_schema
      console.log('Checking if profiles table exists...');
      const { error: checkError } = await supabase.from('profiles').select('count').limit(1);
      
      if (checkError && checkError.code === '42P01') {
        console.log('Profiles table does not exist, attempting to create it...');
        
        // Try to create the profiles table
        try {
          // First approach: Try using Supabase's SQL API
          const { error: sqlError } = await supabase.auth.admin.executeSql(createProfilesTable);
          
          if (sqlError) {
            console.error('Error using admin.executeSql:', sqlError);
            // Try second approach using SQL RPC if available
            try {
              const { error: rpcError } = await supabase.rpc('exec_sql', { sql: createProfilesTable });
              if (rpcError) {
                console.error('Error using RPC exec_sql:', rpcError);
              } else {
                console.log('Created profiles table using RPC');
              }
            } catch (rpcErr) {
              console.error('RPC execution error:', rpcErr);
            }
          } else {
            console.log('Created profiles table using SQL API');
          }
        } catch (createErr) {
          console.error('Error creating table:', createErr);
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
