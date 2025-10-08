# Enable Realtime for Chat - Step by Step Guide

## ⚠️ CRITICAL: Realtime Must Be Enabled

The conversation list won't update in real-time unless Supabase Realtime is enabled for the `messages` table.

## 🔍 Step 1: Check Console Logs

1. Open your app in the browser
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Look for these messages when you load the page:

### ✅ **If Working (You'll See):**
```
🔄 Setting up conversation list real-time subscription for user: xxx
📡 Conversation context subscription status: SUBSCRIBED
✅ Successfully subscribed to conversation updates
🎯 Conversation list will now update in real-time
```

### ❌ **If NOT Working (You'll See):**
```
🔄 Setting up conversation list real-time subscription for user: xxx
📡 Conversation context subscription status: CHANNEL_ERROR
❌ Error subscribing to conversation updates
⚠️ Make sure Realtime is enabled in Supabase Dashboard
```

OR you might see:
```
📡 Conversation context subscription status: TIMED_OUT
⏱️ Subscription timed out
```

## 🛠️ Step 2: Enable Realtime in Supabase

### Option A: Via Supabase Dashboard (Easiest - 2 minutes)

1. **Go to your Supabase Dashboard**: https://app.supabase.com
2. **Select your project**
3. **Navigate to**: Database → Replication (left sidebar)
4. **Find the `messages` table** in the list
5. **Click the toggle** next to "Realtime" to turn it ON (should be green)
6. **Click "Save"** at the bottom
7. **Wait 10-15 seconds** for changes to propagate

![Realtime Toggle Location](https://i.imgur.com/placeholder.png)

**Tables that need Realtime enabled:**
- ✅ `messages` (MOST IMPORTANT)
- ✅ `conversation_participants` (for when new conversations are created)
- ✅ `conversations` (optional, but recommended)
- ✅ `notifications` (if using notifications)

### Option B: Via SQL (Advanced)

Run this in the SQL Editor:

```sql
-- Enable Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable for conversation_participants
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;

-- Enable for conversations (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Verify it worked
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

You should see `messages` in the results!

## 🧪 Step 3: Test It

1. **Refresh your app** (full page refresh: Cmd+R or Ctrl+R)
2. **Check console logs again** - should now see "SUBSCRIBED"
3. **Open app in TWO browsers**:
   - Browser 1: User A
   - Browser 2: User B
4. **Send message from User B to User A**
5. **Watch User A's conversation list** - it should update WITHOUT refreshing!

### What to Look For:

**In User A's Console:**
```
✅ Message change detected in conversation context: {eventType: "INSERT", ...}
🔄 Refreshing conversation list...
Fetching conversations for user: xxx
Fetched conversations: N
```

**In User A's UI:**
- ✅ Conversation with User B moves to top of list
- ✅ Last message shows the new message
- ✅ Unread count increases
- ✅ Badge count updates

## 🚨 Still Not Working?

### Check 1: Database Migration

Did you run the database migration? This adds the `seen` column:

```sql
-- Check if 'seen' column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND column_name = 'seen';
```

**If no results**: Run `lib/fix-messages-schema.sql` in SQL Editor!

### Check 2: RLS Policies

Make sure Row Level Security allows reading messages:

```sql
-- Check policies on messages table
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'messages';
```

You should see policies that allow SELECT for conversation participants.

**If problematic**: Run `lib/fix-chat-rls-simple.sql` for permissive policies.

### Check 3: Network Connection

1. Open DevTools → Network tab
2. Filter by "WS" (WebSocket)
3. Look for connection to: `wss://[your-project].supabase.co/realtime/v1/websocket`
4. Status should be "101 Switching Protocols" (green)

**If no WebSocket connection**:
- Check firewall/proxy settings
- Try different network
- Check Supabase project status

### Check 4: Supabase Project Status

1. Go to Supabase Dashboard
2. Check if project is paused or has issues
3. Check "Project Settings → General" for any warnings

### Check 5: Environment Variables

Verify in your `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Restart dev server** after changing env vars!

## 📊 Debugging Real-time Issues

### Enable Verbose Logging

In `contexts/conversation-context.tsx`, the subscription is already set up with detailed logs. Watch the console for:

1. **Setup**: `🔄 Setting up conversation list real-time subscription`
2. **Connection**: `📡 Conversation context subscription status: SUBSCRIBED`
3. **Events**: `✅ Message change detected in conversation context`
4. **Refresh**: `🔄 Refreshing conversation list...`

### Test Subscription Manually

In browser console, run:

```javascript
// Test if Supabase client is configured
console.log('Supabase URL:', supabase.supabaseUrl);

// Test subscription manually
const testChannel = supabase
  .channel('test_messages')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'messages'
  }, (payload) => {
    console.log('TEST: Message change detected!', payload);
  })
  .subscribe((status) => {
    console.log('TEST: Subscription status:', status);
  });

// Send a test message from another browser and watch console
```

### Check Supabase Logs

1. Go to Supabase Dashboard
2. Navigate to "Logs" → "Realtime Logs"
3. Look for connection attempts and errors
4. Check if your table subscriptions are shown

## 🎯 Quick Fix Checklist

- [ ] Opened browser DevTools console (F12)
- [ ] Verified "SUBSCRIBED" status in console
- [ ] Enabled Realtime for `messages` table in Supabase
- [ ] Waited 10-15 seconds after enabling
- [ ] Refreshed the app (full page refresh)
- [ ] Checked for WebSocket connection in Network tab
- [ ] Verified `seen` column exists (ran migration)
- [ ] Tested with two browsers/users
- [ ] Checked Supabase project is active (not paused)
- [ ] Verified environment variables are correct

## 🆘 Emergency Fallback: Polling

If real-time still doesn't work, you can add polling as a temporary solution:

In `contexts/conversation-context.tsx`, add after the real-time subscription:

```typescript
// Fallback: Poll every 10 seconds
const pollingInterval = setInterval(() => {
  console.log('⏱️ Polling for conversation updates...');
  fetchConversations();
}, 10000);

return () => {
  supabase.removeChannel(channel);
  clearInterval(pollingInterval); // ✅ Add this
};
```

**Note**: This is NOT recommended for production, but can help while debugging.

## ✅ Success Indicators

When everything is working correctly, you should see:

### On Page Load:
```
🔄 Setting up conversation list real-time subscription for user: xxx
Fetching conversations for user: xxx
Fetched conversations: N
📡 Conversation context subscription status: SUBSCRIBED
✅ Successfully subscribed to conversation updates
🎯 Conversation list will now update in real-time
```

### When Message is Sent:
```
✅ Message change detected in conversation context: {...}
🔄 Refreshing conversation list...
Fetching conversations for user: xxx
Fetched conversations: N
```

### In the UI:
- ✅ Conversation list updates WITHOUT refresh
- ✅ Last message preview updates instantly
- ✅ Unread count updates correctly
- ✅ Conversations reorder by latest message
- ✅ Badge counts update everywhere

## 📞 Still Having Issues?

If you've tried everything and it still doesn't work:

1. **Share console logs** - especially the subscription status
2. **Check Supabase Realtime logs** in dashboard
3. **Verify WebSocket connection** in Network tab
4. **Try with simple RLS policies** (`lib/fix-chat-rls-simple.sql`)
5. **Test in incognito mode** (rules out extensions/cache)

Most issues are resolved by:
1. ✅ Enabling Realtime in Supabase Dashboard
2. ✅ Waiting 10-15 seconds after enabling
3. ✅ Full page refresh
4. ✅ Running the database migration

Good luck! 🚀
