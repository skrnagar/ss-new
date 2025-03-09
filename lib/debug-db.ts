import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const debugDatabase = async () => {
  try {
    console.log("Debugging database setup...");

    // Check comments table structure
    console.log("\n--- COMMENTS TABLE STRUCTURE ---");
    const { data: commentStructure, error: commentStructureError } = await supabase.rpc(
      "exec_sql",
      {
        sql_string: `
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'comments'
        `,
      }
    );

    if (commentStructureError) {
      console.error("Error checking comments table structure:", commentStructureError);
    } else {
      console.log(commentStructure);
    }

    // Check RLS policies on comments table
    console.log("\n--- COMMENTS TABLE RLS POLICIES ---");
    const { data: commentPolicies, error: commentPoliciesError } = await supabase.rpc("exec_sql", {
      sql_string: `
          SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
          FROM pg_policies 
          WHERE tablename = 'comments'
        `,
    });

    if (commentPoliciesError) {
      console.error("Error checking comments table policies:", commentPoliciesError);
    } else {
      console.log(commentPolicies);
    }

    // Check if comments RLS is enabled
    console.log("\n--- COMMENTS TABLE RLS STATUS ---");
    const { data: commentRls, error: commentRlsError } = await supabase.rpc("exec_sql", {
      sql_string: `
          SELECT tablename, rowsecurity 
          FROM pg_tables 
          WHERE tablename = 'comments'
        `,
    });

    if (commentRlsError) {
      console.error("Error checking comments table RLS status:", commentRlsError);
    } else {
      console.log(commentRls);
    }

    console.log("\nDatabase debugging completed!");
  } catch (error) {
    console.error("Unexpected error during database debugging:", error);
  }
};

debugDatabase();
