
const { createClient } = require("./supabase-server.cjs");
const { readFileSync } = require("fs");
const { join } = require("path");

async function main() {
  const supabase = createClient();
  
  const sql = readFileSync(join(process.cwd(), "lib", "storage-policies.sql"), "utf8");
  
  const { error } = await supabase.sql(sql);
  if (error) {
    console.error("Error applying storage policies:", error);
    process.exit(1);
  }
  
  console.log("Storage policies applied successfully");
}

main();
