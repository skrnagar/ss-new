# Add Service Role Key to .env.local

## Steps

1. **Get your Service Role Key:**
   - Go to your Supabase Dashboard (the same one you're using for the frontend)
   - Navigate to: **Settings → API**
   - Find the **`service_role`** key (it's a long key, different from the anon key)
   - Click the eye icon to reveal it, then copy it

2. **Add to .env.local:**
   
   Open your `.env.local` file and add this line:
   
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-paste-here
   ```
   
   Your `.env.local` should now look something like:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Restart your dev server:**
   - Stop the current server (Ctrl+C)
   - Run `npm run dev` again

4. **Test the setup page:**
   - Go to `/admin-dashboard/setup`
   - Create your admin user
   - Login at `/admin-dashboard/login`

## Why Service Role Key?

The service role key bypasses Row Level Security (RLS), which is necessary for admin operations like creating admin users. It's safe to use server-side (in API routes) but should NEVER be exposed to the client.

## Alternative: Fix RLS Policies

If you prefer not to use the service role key, you can fix the RLS policies by running `lib/fix-admin-rls-now.sql` in Supabase SQL Editor. However, using the service role key is the recommended approach for admin operations.

