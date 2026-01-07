# Fix: Unable to See Applicant Details

## Problem
Job posters cannot see applicant details on the `/jobs/[id]/applications` page.

## Root Causes
1. Missing `email` column in profiles table
2. RLS policies blocking profile data access
3. Foreign key relationship issues

## Solution

### Step 1: Run SQL Fix in Supabase

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `lib/fix-job-applications-access.sql`
5. Click **Run**

This will:
- Add email column to profiles
- Sync existing emails from auth.users
- Create auto-sync trigger
- Update RLS policies to allow job posters to view applicant profiles
- Add performance indexes

### Step 2: Verify the Fix

Visit the debug page to check if data is loading:
```
http://localhost:3000/jobs/debug
```

This page shows:
- Your posted jobs
- Application data with profile joins
- Sample profiles with email field

### Step 3: Check Applications Page

Go to any job you posted:
```
/jobs/[job-id]/applications
```

You should now see:
- ✅ Applicant names and avatars
- ✅ Email addresses (clickable mailto links)
- ✅ Headlines
- ✅ Cover letters
- ✅ Resume links
- ✅ "View Profile" buttons

### Step 4: Verify in Browser Console

Open browser console (F12) and check for:
```javascript
Applications data: [...]  // Should show array of applications
Applications error: null  // Should be null if successful
```

## Common Issues & Solutions

### Issue 1: "profiles" relation not found
**Solution:** The foreign key might not be properly set up. Run:
```sql
ALTER TABLE job_applications 
DROP CONSTRAINT IF EXISTS job_applications_user_id_fkey;

ALTER TABLE job_applications
ADD CONSTRAINT job_applications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
```

### Issue 2: Email column is NULL
**Solution:** Run the email sync part of the fix script again, or manually update:
```sql
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');
```

### Issue 3: RLS blocking access
**Solution:** Verify the policy exists:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'profiles' 
AND policyname LIKE '%applicant%';
```

Should show a policy allowing job posters to view applicant profiles.

### Issue 4: Data shows "Anonymous User"
**Solution:** This means profiles data isn't being fetched. Check:
1. Run the full fix script
2. Verify foreign key exists
3. Check RLS policies

## Alternative: Manual Profile Fetch

If the join still doesn't work, you can fetch profiles separately in the applications page code.

## Testing Checklist

- [ ] SQL fix script executed successfully
- [ ] Debug page shows job data
- [ ] Debug page shows applications with profiles
- [ ] Debug page shows profiles have email field
- [ ] Applications page loads without errors
- [ ] Can see applicant names and avatars
- [ ] Can see applicant emails
- [ ] "View Profile" links work
- [ ] Application status updates work

## Support

If issues persist after running the fix:

1. Check browser console for errors
2. Visit `/jobs/debug` page
3. Copy the JSON output from debug page
4. Check Supabase logs for RLS policy violations
5. Verify the foreign key constraint exists:
   ```sql
   SELECT conname, conrelid::regclass, confrelid::regclass
   FROM pg_constraint
   WHERE conname LIKE '%job_applications%';
   ```

## Files Changed

- `lib/fix-job-applications-access.sql` - SQL fix script
- `app/jobs/[id]/applications/page.tsx` - Updated to handle missing data gracefully
- `app/jobs/debug/page.tsx` - Debug page for troubleshooting

## What the Fix Does

### 1. Adds Email Column
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
```

### 2. Syncs Existing Emails
```sql
UPDATE profiles SET email = auth.users.email WHERE...
```

### 3. Creates Auto-Sync Trigger
Automatically updates profile email when auth.users email changes.

### 4. Updates RLS Policies
Allows job posters to view profiles of applicants:
```sql
CREATE POLICY "Job posters can view applicant profiles"
  ON profiles FOR SELECT
  USING (
    -- View own profile OR
    -- View profiles of users who applied to your jobs
  );
```

### 5. Adds Indexes
For better query performance:
```sql
CREATE INDEX idx_job_applications_job_user ON job_applications(job_id, user_id);
CREATE INDEX idx_jobs_posted_by ON jobs(posted_by);
```

## Expected Result

After the fix, visiting `/jobs/[id]/applications` should show:

```
┌─────────────────────────────────────────┐
│ All Applications (3)                     │
├─────────────────────────────────────────┤
│ 👤 John Smith                           │
│    Senior Safety Engineer                │
│    john@example.com | Applied 2 days ago │
│                                          │
│ Cover Letter:                            │
│ "I am excited to apply for this role..." │
│                                          │
│ 🔗 View Resume/Portfolio                │
│                                          │
│ Internal Notes: (empty)                  │
│                                          │
│ [View Profile] [Review] [Pending ▼]     │
└─────────────────────────────────────────┘
```

## Success Indicators

✅ Applicant name displays (not "Anonymous User")
✅ Avatar shows (or initials if no avatar)
✅ Email is visible and clickable
✅ Headline shows (if user has one)
✅ Cover letter is readable
✅ Resume link works (if provided)
✅ View Profile button navigates to profile
✅ Status dropdown works
✅ Internal notes can be added

Your jobs feature should now have full recruiter functionality! 🎉

