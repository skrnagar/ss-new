import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const migrateDatabase = async () => {
  try {
    console.log("Running likes and comments migration...");

    const sqlPath = path.join(process.cwd(), "lib", "likes-comments-migration.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    const { error } = await supabase.rpc("exec_sql", { sql_string: sql });

    if (error) {
      console.error("Migration error:", error);
      process.exit(1);
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Unexpected error during migration:", error);
    process.exit(1);
  }
};

migrateDatabase();
