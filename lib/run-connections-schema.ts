
import { createClient } from "@/lib/supabase-server";
import fs from "fs";
import path from "path";

async function main() {
  try {
    const supabase = createClient();
    
    const schemaPath = path.join(process.cwd(), "lib", "connections-schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");
    
    const { error } = await supabase.from('connections').select('id').limit(1);
    
    if (error?.message.includes('relation "connections" does not exist')) {
      const { error: schemaError } = await supabase.sql(schema);
      if (schemaError) {
        throw schemaError;
      }
      console.log("Successfully created connections schema");
    } else {
      console.log("Connections table already exists");
    }
    
  } catch (error) {
    console.error("Error setting up connections schema:", error);
    process.exit(1);
  }
}

main();
