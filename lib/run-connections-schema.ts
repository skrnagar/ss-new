import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase-server";

async function main() {
  try {
    const supabase = createClient();

    const schemaPath = path.join(process.cwd(), "lib", "connections-schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    const { error } = await supabase.from("connections").select("id").limit(1);

    if (error?.message.includes('relation "connections" does not exist')) {
      // Schema migrations must be run using the Supabase SQL editor, CLI, or a Postgres client (e.g., pg), not the Supabase JS client.
      // Please run the contents of lib/connections-schema.sql manually in your Supabase project if the table does not exist.
      throw new Error('Connections table does not exist. Please run the schema migration manually.');
    } else {
      console.log("Connections table already exists");
    }
  } catch (error) {
    console.error("Error setting up connections schema:", error);
    process.exit(1);
  }
}

main();
