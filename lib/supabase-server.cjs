
const { createClient } = require('@supabase/supabase-js');

function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL or key is missing in environment variables");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

module.exports = {
  createClient: createServerClient
};
