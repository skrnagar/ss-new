import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixCommentsRLS() {
  try {
    console.log("Running comments RLS fix migration...");

    const sqlPath = path.join(process.cwd(), "lib", "fix-comments-rls.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    const { error } = await supabaseClient.rpc("exec_sql", { sql_string: sql });

    if (error) {
      console.error("Migration error:", error);
      process.exit(1);
    }

    console.log("Comments RLS fix completed successfully!");
  } catch (error) {
    console.error("Unexpected error during migration:", error);
    process.exit(1);
  }
}

fixCommentsRLS();
