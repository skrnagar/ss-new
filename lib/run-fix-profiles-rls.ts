
import { supabase } from './supabase';
import * as fs from 'fs';
import * as path from 'path';

async function fixProfilesRLS() {
  try {
    console.log('Running profiles RLS fix...');
    
    const sqlFilePath = path.join(process.cwd(), 'lib', 'fix-profiles-rls.sql');
    const sqlQuery = fs.readFileSync(sqlFilePath, 'utf8');
    
    const { error } = await supabase.rpc('exec_sql', { sql_query: sqlQuery });
    
    if (error) {
      console.error("Error running profiles RLS fix:", error);
      return;
    }
    
    console.log("Profile RLS policy update completed successfully.");
  } catch (error) {
    console.error("Failed to run profiles RLS fix:", error);
  }
}

fixProfilesRLS();
