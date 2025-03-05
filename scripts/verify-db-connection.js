
const { createClient } = require('@supabase/supabase-js');

async function verifyDbConnection() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials in environment variables');
      return;
    }
    
    console.log('Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Try to query the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying profiles table:', error.message);
      console.log('This may indicate the tables have not been created yet');
    } else {
      console.log('Successfully connected to database!');
      console.log('Profiles found:', data.length);
      if (data.length > 0) {
        console.log('Sample profile:', data[0]);
      }
    }
  } catch (error) {
    console.error('Error connecting to Supabase:', error.message);
  }
}

verifyDbConnection();
