# Fix RLS Issue for Admin Dashboard

## The Problem

Row Level Security (RLS) is blocking admin user creation. The error is:
```
new row violates row-level security policy for table "admin_users"
```

## Solution Options

### Option 1: Use Service Role Key (Recommended)

1. **Get your Service Role Key from Supabase:**
   - Go to Supabase Dashboard → Settings → API
   - Copy the `service_role` key (NOT the anon key)
   - ⚠️ **Keep this secret!** Never expose it in client-side code.

2. **Add to your `.env.local` file:**
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. **Restart your dev server:**
   ```bash
   npm run dev
   ```

The code now uses the service role key for admin operations, which bypasses RLS.

### Option 2: Fix RLS Policies in Supabase

If you prefer to keep using RLS, run this SQL in Supabase SQL Editor:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Allow all admin_users operations" ON admin_users;
DROP POLICY IF EXISTS "Allow all admin_sessions operations" ON admin_sessions;
DROP POLICY IF EXISTS "Allow all admin_activity_log operations" ON admin_activity_log;

-- Recreate with proper permissions
CREATE POLICY "Allow all admin_users operations"
  ON admin_users
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all admin_sessions operations"
  ON admin_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all admin_activity_log operations"
  ON admin_activity_log
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### Option 3: Temporarily Disable RLS (For Testing Only)

⚠️ **Only for development/testing!**

```sql
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log DISABLE ROW LEVEL SECURITY;
```

After creating your admin user, re-enable RLS:
```sql
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
```

## After Fixing

1. Go to `/admin-dashboard/setup`
2. Create your admin user
3. Login at `/admin-dashboard/login`

## Recommended Approach

**Use Option 1 (Service Role Key)** - It's the most secure and reliable approach for server-side admin operations.

