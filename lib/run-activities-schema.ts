
import { createClient } from "@supabase/supabase-js";
import fs from 'fs';
import path from 'path';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Read SQL file
const sqlFilePath = path.join(process.cwd(), 'lib', 'activities-schema.sql');
const sqlQuery = fs.readFileSync(sqlFilePath, 'utf8');

async function main() {
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables for Supabase');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('Running activities schema SQL...');

  try {
    const { error } = await supabase.rpc('exec_sql', { query: sqlQuery });
    
    if (error) {
      throw error;
    }
    
    console.log('Activities schema SQL executed successfully!');
  } catch (error) {
    console.error('Error executing activities schema SQL:', error);
    process.exit(1);
  }
}

main();
