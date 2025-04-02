
import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase-server";

async function dropPostScores() {
  try {
    const supabase = createClient();
    
    const sqlPath = path.join(process.cwd(), "lib", "drop-post-scores.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    const { error } = await supabase.rpc("exec_sql", { sql_string: sql });
    
    if (error) {
      throw error;
    }
    
    console.log("Successfully dropped post_scores and its relations");
  } catch (error) {
    console.error("Error dropping post_scores:", error);
    process.exit(1);
  }
}

dropPostScores();
