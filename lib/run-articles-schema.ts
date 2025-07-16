
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function setupArticlesSchema() {
  try {
    console.log("Running articles schema migration...");

    const sqlPath = path.join(process.cwd(), "lib", "articles-schema.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    const { error } = await supabaseClient.rpc("exec_sql", { sql_string: sql });

    if (error) {
      console.error("Migration error:", error);
      process.exit(1);
    }

    console.log("Articles schema migration completed successfully!");
  } catch (error) {
    console.error("Unexpected error during migration:", error);
    process.exit(1);
  }
}

setupArticlesSchema();
export {}
