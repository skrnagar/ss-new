
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function setupExecSQL() {
  try {
    console.log("Creating exec_sql function...");
    
    const sqlPath = path.join(process.cwd(), "lib", "create-exec-sql-function.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });
    
    if (error) {
      // If exec_sql doesn't exist yet, execute the SQL directly
      const { error: directError } = await supabase
        .from('_sqlj')
        .select()
        .eq('query', sql)
        .single();
        
      if (directError) {
        throw directError;
      }
    }
    
    console.log("exec_sql function created successfully!");
  } catch (error) {
    console.error("Error creating exec_sql function:", error);
    process.exit(1);
  }
}

setupExecSQL();
