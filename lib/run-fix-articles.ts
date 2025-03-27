
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runFix() {
  try {
    const sqlPath = path.join(process.cwd(), "lib", "fix-articles-author.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    
    const { error } = await supabase.rpc("exec_sql", { sql_string: sql });
    
    if (error) throw error;
    console.log("Successfully updated articles table foreign key");
  } catch (error) {
    console.error("Error running fix:", error);
  }
}

runFix();
