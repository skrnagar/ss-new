import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase-server";

async function runPostUpdateSchema() {
  try {
    const supabase = createClient();

    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), "lib", "posts-migration.sql");
    const sql = fs.readFileSync(sqlFilePath, "utf8");

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql_query: sql });

    if (error) {
      console.error("Error executing SQL:", error);
      return { success: false, error };
    }

    console.log("Posts schema update completed successfully");
    return { success: true };
  } catch (error) {
    console.error("Error updating posts schema:", error);
    return { success: false, error };
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  runPostUpdateSchema()
    .then((result) => {
      if (result.success) {
        console.log("Posts schema update complete");
      } else {
        console.error("Posts schema update failed:", result.error);
      }
    })
    .catch((error) => {
      console.error("Unexpected error:", error);
    });
}

export default runPostUpdateSchema;
