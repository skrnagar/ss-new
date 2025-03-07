
import { supabase } from './supabase';
import * as fs from 'fs';
import * as path from 'path';

async function fixProfilesRLSFinal() {
  try {
    console.log('Running final profiles RLS fix...');
    
    const sqlFilePath = path.join(process.cwd(), 'lib', 'fix-profiles-rls-final.sql');
    const sqlQuery = fs.readFileSync(sqlFilePath, 'utf8');
    
    // First try using the exec_sql RPC function
    const { error } = await supabase.rpc('exec_sql', { sql_query: sqlQuery });
    
    if (error) {
      console.error("Error running profiles RLS fix:", error);
      
      // Fallback approach - try direct queries instead for each policy
      console.log("Attempting individual policy updates...");
      
      // Disable RLS first
      await supabase.rpc('exec_sql', { 
        sql_query: 'ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;' 
      });
      
      // Enable RLS
      await supabase.rpc('exec_sql', { 
        sql_query: 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;' 
      });
      
      // Drop all policies
      await supabase.rpc('exec_sql', { 
        sql_query: 'DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;' 
      });
      
      await supabase.rpc('exec_sql', { 
        sql_query: 'DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;' 
      });
      
      await supabase.rpc('exec_sql', { 
        sql_query: 'DROP POLICY IF EXISTS "Users can update own profile" ON profiles;' 
      });
      
      await supabase.rpc('exec_sql', { 
        sql_query: 'DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;' 
      });
      
      await supabase.rpc('exec_sql', { 
        sql_query: 'DROP POLICY IF EXISTS "Users can update any fields in their own profile" ON profiles;' 
      });
      
      // Create new policies one by one
      await supabase.rpc('exec_sql', { 
        sql_query: 'CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);' 
      });
      
      await supabase.rpc('exec_sql', { 
        sql_query: 'CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);' 
      });
      
      await supabase.rpc('exec_sql', { 
        sql_query: 'CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);' 
      });
      
      console.log("Individual policy updates complete");
    } else {
      console.log("Profile RLS policy update completed successfully through single SQL execution.");
    }
    
    // Verify the policies
    const { data: policies, error: policyError } = await supabase
      .from('_rls_policies')
      .select('*')
      .eq('table_name', 'profiles');
      
    if (policyError) {
      console.error("Error verifying policies:", policyError);
    } else {
      console.log("Current profile policies:", policies);
    }
  } catch (error) {
    console.error("Failed to run profiles RLS fix:", error);
  }
}

fixProfilesRLSFinal();
