
import { supabase } from './supabase';
import * as fs from 'fs';
import * as path from 'path';

async function fixProfileUpdate() {
  try {
    console.log('Running profile update fix...');
    
    const sqlFilePath = path.join(process.cwd(), 'lib', 'fix-profile-update.sql');
    const sqlQuery = fs.readFileSync(sqlFilePath, 'utf8');
    
    const { error } = await supabase.rpc('exec_sql', { sql_query: sqlQuery });
    
    if (error) {
      console.error("Error running profile update fix:", error);
      return;
    }
    
    console.log("Profile update fix completed successfully.");
  } catch (error) {
    console.error("Failed to run profile update fix:", error);
  }
}

fixProfileUpdate();
