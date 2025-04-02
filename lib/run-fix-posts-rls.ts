
import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase-server";

async function main() {
  try {
    const supabase = createClient();
    
    const sqlPath = path.join(process.cwd(), "lib", "fix-posts-rls.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    const { error } = await supabase.rpc("exec_sql", { sql_string: sql });
    
    if (error) {
      throw error;
    }
    
    console.log("Successfully updated posts RLS policies");
  } catch (error) {
    console.error("Error updating posts RLS:", error);
    process.exit(1);
  }
}

main();
