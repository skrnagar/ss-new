# Fix Chat Real-time Updates

This guide will help you fix the chat real-time messaging issue where messages don't appear until you refresh the page.

## Problem
Chat messages are not displaying in real-time for the receiving user. The badge count updates but messages only appear after refreshing the page.

## Root Cause
1. The `messages` table is missing the `seen` and `seen_at` fields that the frontend code expects
2. Supabase Realtime is not enabled for the `messages` table
3. Real-time subscriptions need proper configuration

## Solution

### Option 1: Run via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `lib/fix-messages-schema.sql`
4. Click "Run" to execute the SQL

### Option 2: Run via Node.js Script

You'll need the `SUPABASE_SERVICE_ROLE_KEY` environment variable set.

1. Add to your `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

2. Run the migration script:
   ```bash
   npx ts-node lib/run-fix-messages-schema.ts
   ```

### Option 3: Manual Steps in Supabase Dashboard

1. Go to your Supabase Dashboard → Database → Tables → messages
2. Click "Edit Table"
3. Add the following columns if they don't exist:
   - `seen` (type: `bool`, default: `false`)
   - `seen_at` (type: `timestamptz`, nullable)
   - `image_url` (type: `text`, nullable)

4. Go to Database → Replication
5. Find the `messages` table and enable Realtime if it's not already enabled
6. Click "Save"

## Verification

After running the fix:

1. Open your app in two different browsers or incognito windows
2. Log in as two different users
3. Start a conversation
4. Send a message from User A
5. Verify that User B sees the message immediately without refreshing

## What Was Fixed

### Code Changes:
1. **chat-window.tsx**: Improved real-time subscription with:
   - Proper channel configuration with `broadcast: { self: false }`
   - Separate listeners for INSERT and UPDATE events
   - Subscription status logging for debugging
   - Proper channel cleanup using `supabase.removeChannel()`

2. **conversation-context.tsx**: Enhanced subscription with:
   - Better status logging
   - Proper payload handling
   - Configuration for broadcast settings

### Database Changes:
1. Added `seen` column to track message read status
2. Added `seen_at` timestamp for when message was seen
3. Added `image_url` for future image support
4. Created indexes for better query performance
5. Enabled Supabase Realtime for the `messages` table

## Troubleshooting

If messages still don't update in real-time:

1. **Check browser console** for subscription status logs:
   - Should see "Successfully subscribed to channel: messages:CONVERSATION_ID"
   - Should see "Subscription status: SUBSCRIBED"

2. **Verify Realtime is enabled**:
   - Go to Supabase Dashboard → Database → Replication
   - Ensure `messages` table has Realtime enabled

3. **Check RLS policies**:
   - Ensure messages policies allow SELECT for conversation participants
   - Run `lib/fix-chat-rls-simple.sql` if needed for simplified policies

4. **Verify environment**:
   - Clear browser cache
   - Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
   - Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correct

5. **Check Network**:
   - Open browser DevTools → Network tab
   - Filter by "WS" (WebSocket)
   - Verify WebSocket connection to Supabase is established

## Additional Notes

- The polling fallback (every 5 seconds) ensures messages appear even if real-time fails
- Console logs help debug subscription issues
- The `seen` status now properly tracks when messages are read
- Badge counts update independently and will continue working

If you continue to experience issues, check the browser console logs for specific error messages.
