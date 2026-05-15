#!/usr/bin/env node
/**
 * Applies production SQL via Supabase exec_sql (service role).
 * Usage: npm run db:bootstrap
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i);
    let val = t.slice(i + 1);
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const FILES = [
  "lib/production/01-knowledge-tables.sql",
  "lib/production/02-phase5-dashboards.sql",
  "lib/production/03-phase4-audit.sql",
  "lib/production/04-seed-demo-data.sql",
];

async function runFile(relPath) {
  const full = path.join(root, relPath);
  const sql = fs.readFileSync(full, "utf8");
  console.log(`\n▶ ${relPath}`);
  const { error } = await supabase.rpc("exec_sql", { sql_string: sql });
  if (error) {
    console.error(`  ✗ ${error.message}`);
    return false;
  }
  console.log("  ✓ OK");
  return true;
}

async function verify() {
  const tables = [
    "knowledge_resources",
    "lms_courses",
    "audit_bookings",
    "incidents",
    "compliance_items",
  ];
  console.log("\nVerification:");
  for (const t of tables) {
    const { error, count } = await supabase.from(t).select("*", { count: "exact", head: true });
    console.log(`  ${t}:`, error ? `✗ ${error.message}` : `✓ (${count ?? "?"} rows)`);
  }
  const { count: kCount } = await supabase
    .from("knowledge_resources")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");
  const { count: cCount } = await supabase
    .from("lms_courses")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);
  console.log(`  approved knowledge: ${kCount ?? 0}, published courses: ${cCount ?? 0}`);
}

async function main() {
  console.log("Safety Shaper — Supabase production bootstrap");
  let ok = true;
  for (const f of FILES) {
    if (!(await runFile(f))) ok = false;
  }
  await verify();
  if (!ok) {
    console.error("\nBootstrap had errors. Fix SQL or run failing files in Supabase SQL Editor.");
    process.exit(1);
  }
  console.log("\nDone. Refresh Knowledge Center and Training pages in the app.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
