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

async function runExperienceEducationSchema() {
  try {
    console.log("Running experience and education schema migration...");

    const sqlPath = path.join(process.cwd(), "lib", "experience-education-schema.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    const { error } = await supabase.rpc("exec_sql", { sql_string: sql });

    if (error) {
      console.error("Migration error:", error);
      process.exit(1);
    }

    console.log("Experience and education schema created successfully!");
  } catch (error) {
    console.error("Unexpected error during migration:", error);
    process.exit(1);
  }
}

runExperienceEducationSchema();
export {};
