const fs = require("node:fs");
const path = require("node:path");
const { createClient } = require("@supabase/supabase-js");

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase environment variables");
  console.log("Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function runFixMessagesSchema() {
  try {
    console.log("Running messages schema fix...");

    const sqlPath = path.join(process.cwd(), "lib", "fix-messages-schema.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    // Split SQL into individual statements and run them
    const statements = sql
      .split(';')
      .map((s: string) => s.trim())
      .filter((s: string) => s && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.includes('SELECT')) {
        console.log("Executing final check...");
        const { data, error } = await supabase.rpc("exec_sql", { sql_string: statement });
        if (error) {
          console.error("Error:", error);
        } else {
          console.log("Result:", data);
        }
      } else {
        const { error } = await supabase.rpc("exec_sql", { sql_string: statement + ';' });
        if (error) {
          console.error("Error executing statement:", error);
        } else {
          console.log("Statement executed successfully");
        }
      }
    }

    console.log("Messages schema fix completed successfully!");
  } catch (error) {
    console.error("Unexpected error during fix:", error);
    process.exit(1);
  }
}

runFixMessagesSchema();
export {};
