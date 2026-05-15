/** Detect PostgREST / Postgres errors when a table or view is missing. */
export function isRelationMissing(err: unknown, relation?: string): boolean {
  const o = err as { code?: string; message?: string; status?: number | string };
  const msg = (o?.message || "").toLowerCase();
  const code = o?.code != null ? String(o.code) : "";
  const status = o?.status != null ? Number(o.status) : NaN;

  const missing =
    code === "42P01" ||
    code === "PGRST205" ||
    code === "PGRST204" ||
    (!Number.isNaN(status) && status === 404) ||
    msg.includes("does not exist") ||
    msg.includes("could not find the table") ||
    msg.includes("schema cache");

  if (!missing) return false;
  if (!relation) return true;
  return msg.includes(relation.toLowerCase());
}

export const PRODUCTION_BOOTSTRAP_HINT =
  "Run `npm run db:bootstrap` from the project root (requires SUPABASE_SERVICE_ROLE_KEY in .env.local), or apply lib/production/*.sql in Supabase SQL Editor.";
