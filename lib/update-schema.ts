import { createClient } from "@supabase/supabase-js";

const updateSchema = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase URL or key in environment variables");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log("Adding missing columns to profiles table...");

    // Run SQL to add missing columns
    const alterTableSQL = `
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS company TEXT,
      ADD COLUMN IF NOT EXISTS position TEXT,
      ADD COLUMN IF NOT EXISTS location TEXT;
    `;

    const { error } = await supabase.from("profiles").select("id").limit(1);

    if (!error) {
      // Table exists, add columns
      const { error: alterError } = await supabase.rpc("exec_sql", { sql: alterTableSQL });

      if (alterError) {
        console.error("Error updating schema:", alterError.message);
      } else {
        console.log("Schema updated successfully");
      }
    } else {
      console.error("Error accessing profiles table:", error.message);
    }


    console.log("Updating posts table RLS policy...");
    const rlsUpdateSQL = `
      -- Drop existing policies
      DROP POLICY IF EXISTS "Enable read access for all users" ON posts;
      DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON posts;

      -- Create new policies
      CREATE POLICY "Enable read access for all users" ON posts FOR SELECT USING (true);
      CREATE POLICY "Enable insert for authenticated users only" ON posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

      -- Grant necessary permissions on materialized view
      GRANT SELECT, INSERT ON post_scores TO authenticated;
      GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
    `;

    const { error: rlsError } = await supabase.rpc("exec_sql", { sql: rlsUpdateSQL });
    if (rlsError) {
      console.error("Error updating RLS policy:", rlsError.message);
    } else {
      console.log("RLS policy updated successfully");
    }


  } catch (error) {
    console.error("Error updating schema:", error);
  }
};

export default updateSchema;