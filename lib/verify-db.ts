import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const verifyDatabase = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase URL or key in environment variables");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Check if profiles table exists
    const { data: profilesTable, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .limit(1);

    if (profilesError) {
      console.error("Error accessing profiles table:", profilesError.message);
      console.log("Creating database tables...");

      // Read SQL from database.sql file
      const sqlPath = path.join(process.cwd(), "lib", "database.sql");

      if (fs.existsSync(sqlPath)) {
        const sql = fs.readFileSync(sqlPath, "utf8");

        // Execute SQL to create tables
        const { error } = await supabase.rpc("exec_sql", { sql });

        if (error) {
          console.error("Error creating database tables:", error.message);
        } else {
          console.log("Database tables created successfully");
        }
      } else {
        console.error("database.sql file not found");
      }
    } else {
      console.log("Database tables verified");
    }
  } catch (error) {
    console.error("Error verifying database:", error);
  }
};

export default verifyDatabase;
