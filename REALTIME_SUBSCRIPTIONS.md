# Real-time Subscriptions Architecture

This document provides a comprehensive overview of all real-time subscriptions in the application using Supabase Realtime.

## Overview

The application uses Supabase's Realtime feature to provide instant updates across the following features:
- Chat messages
- Message badges (unread counts)
- Conversation lists
- Notifications

## Database Prerequisites

### Required: Enable Realtime for Tables

For real-time subscriptions to work, the following tables **must** have Realtime enabled in Supabase:

1. **messages** - Critical for chat functionality
2. **conversations** - For conversation list updates
3. **conversation_participants** - For participant changes
4. **notifications** - For notification updates

#### How to Enable Realtime:

**Option 1: Via Supabase Dashboard (Recommended)**
1. Go to Supabase Dashboard → Database → Replication
2. Find each table in the list
3. Toggle "Realtime" to ON
4. Click Save

**Option 2: Via SQL**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

### Required: Database Schema

The `messages` table must have these columns:
- `id` (UUID) - Primary key
- `conversation_id` (UUID) - Foreign key to conversations
- `sender_id` (UUID) - Foreign key to profiles
- `content` (TEXT) - Message content
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `seen` (BOOLEAN) - Read status
- `seen_at` (TIMESTAMPTZ) - When message was read
- `image_url` (TEXT) - Optional image attachment

**Run this migration if needed:**
```bash
# Via Supabase Dashboard: Copy and run lib/fix-messages-schema.sql
# OR via Node.js:
npx ts-node lib/run-fix-messages-schema.ts
```

## Subscription Pattern

All subscriptions follow this consistent pattern:

```typescript
const channel = supabase
  .channel(`unique_channel_name_${userId}`, {
    config: {
      broadcast: { self: false }, // Don't receive own messages
    },
  })
  .on(
    "postgres_changes",
    {
      event: "INSERT" | "UPDATE" | "DELETE" | "*", // Event type
      schema: "public",
      table: "table_name",
      filter: "column=eq.value", // Optional filter
    },
    (payload) => {
      console.log('Change detected:', payload);
      // Handle the change (usually fetch fresh data)
    }
  )
  .subscribe((status) => {
    console.log('Subscription status:', status);
    if (status === 'SUBSCRIBED') {
      console.log('Successfully subscribed');
    } else if (status === 'CHANNEL_ERROR') {
      console.error('Subscription error');
    }
  });

// Cleanup
return () => {
  supabase.removeChannel(channel);
};
```

## Components with Real-time Subscriptions

### 1. Chat Window (`components/chat/chat-window.tsx`)

**Purpose**: Display messages in real-time for the current conversation

**Channel**: `messages:${conversationId}`

**Listens to**: 
- `messages` table
- Events: INSERT, UPDATE
- Filter: `conversation_id=eq.${conversationId}`

**Behavior**:
- Fetches all messages when new message arrives
- Marks unseen messages as read
- Scrolls to bottom on new messages
- Fallback: Polls every 5 seconds

**Key Features**:
- Separate listeners for INSERT and UPDATE events
- Optimistic updates for sending messages
- Typing indicators via separate broadcast channel

```typescript
const channel = supabase
  .channel(`messages:${conversationId}`, {
    config: { broadcast: { self: false } },
  })
  .on("postgres_changes", {
    event: "INSERT",
    schema: "public",
    table: "messages",
    filter: `conversation_id=eq.${conversationId}`,
  }, fetchMessages)
  .on("postgres_changes", {
    event: "UPDATE",
    schema: "public",
    table: "messages",
    filter: `conversation_id=eq.${conversationId}`,
  }, fetchMessages)
  .subscribe();
```

### 2. Conversation Context (`contexts/conversation-context.tsx`)

**Purpose**: Keep conversation list updated across the app

**Channel**: `conversations_${userId}`

**Listens to**:
- `messages` table - All events
- `conversation_participants` table - All events

**Behavior**:
- Refetches all conversations on any message change
- Updates unread counts
- Maintains conversation list order (by last message)

**Usage**: Used by ChatPanel, ChatInterface, and ChatList components

```typescript
const channel = supabase
  .channel(`conversations_${userId}`, {
    config: { broadcast: { self: false } },
  })
  .on("postgres_changes", {
    event: "*",
    schema: "public",
    table: "messages",
  }, fetchConversations)
  .on("postgres_changes", {
    event: "*",
    schema: "public",
    table: "conversation_participants",
  }, fetchConversations)
  .subscribe();
```

### 3. Navbar Message Badge (`components/navbar.tsx`)

**Purpose**: Show unread message count in desktop navigation

**Channel**: `messages_badge_${userId}`

**Listens to**: 
- `messages` table
- Events: All (*, INSERT, UPDATE, DELETE)

**Behavior**:
- Queries all conversations for current user
- Counts unseen messages where sender_id ≠ current user
- Updates badge count immediately

```typescript
const channel = supabase
  .channel(`messages_badge_${userId}`, {
    config: { broadcast: { self: false } },
  })
  .on("postgres_changes", {
    event: "*",
    schema: "public",
    table: "messages",
  }, fetchUnread)
  .subscribe();
```

### 4. Mobile Navigation Badge (`components/mobile-nav.tsx`)

**Purpose**: Show unread message count in mobile navigation

**Channel**: `mobile_messages_badge_${userId}`

**Listens to**: 
- `messages` table
- Events: All

**Behavior**:
- Same as desktop badge
- Independent subscription for mobile devices
- Updates mobile navigation badge

```typescript
const channel = supabase
  .channel(`mobile_messages_badge_${userId}`, {
    config: { broadcast: { self: false } },
  })
  .on("postgres_changes", {
    event: "*",
    schema: "public",
    table: "messages",
  }, fetchUnread)
  .subscribe();
```

### 5. Notification Dropdown (`components/notification-dropdown.tsx`)

**Purpose**: Show real-time notification updates

**Channel**: `notifications_${userId}`

**Listens to**: 
- `notifications` table
- Events: All
- Filter: `user_id=eq.${userId}`

**Behavior**:
- Refetches notifications on any change
- Updates unread count
- Shows new notifications immediately

```typescript
const channel = supabase
  .channel(`notifications_${userId}`, {
    config: { broadcast: { self: false } },
  })
  .on("postgres_changes", {
    event: "*",
    schema: "public",
    table: "notifications",
    filter: `user_id=eq.${userId}`,
  }, mutate)
  .subscribe();
```

## Subscription Lifecycle

### 1. Initialization
```typescript
useEffect(() => {
  if (!userId) return;
  
  // Set up subscription
  const channel = supabase.channel(...)
  
  return () => {
    // Cleanup
    supabase.removeChannel(channel);
  };
}, [userId]);
```

### 2. Status Monitoring

All subscriptions include status callbacks:
- `SUBSCRIBED` - Successfully connected
- `CHANNEL_ERROR` - Connection failed
- `CLOSED` - Channel closed

### 3. Cleanup

Always use `supabase.removeChannel(channel)` in the cleanup function to prevent memory leaks.

## Polling Fallbacks

Some components use polling as a backup:

### Chat Window
- Polls every 5 seconds
- Ensures messages appear even if real-time fails
- Cleared on component unmount

```typescript
pollingIntervalRef.current = setInterval(() => {
  fetchMessages();
}, 5000);
```

## Debugging Real-time Issues

### Check Subscription Status

Open browser console and look for:
```
✅ "Subscription status: SUBSCRIBED"
✅ "Successfully subscribed to channel: messages:xxx"
❌ "Error subscribing to channel"
❌ "Subscription status: CHANNEL_ERROR"
```

### Verify Realtime is Enabled

1. Go to Supabase Dashboard → Database → Replication
2. Check that all required tables have Realtime enabled
3. Look for green toggle next to table name

### Check RLS Policies

Subscriptions respect Row Level Security:
```sql
-- Users can view messages in their conversations
CREATE POLICY "Users can view messages"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.profile_id = auth.uid()
  )
);
```

### Network Tab

1. Open DevTools → Network
2. Filter by "WS" (WebSocket)
3. Verify WebSocket connection to Supabase
4. Should see: `wss://[project].supabase.co/realtime/v1/websocket`

### Common Issues

#### Messages not updating in real-time
- ✅ Run `lib/fix-messages-schema.sql` to enable Realtime
- ✅ Check that `seen` column exists in messages table
- ✅ Verify RLS policies allow SELECT on messages
- ✅ Check browser console for subscription errors

#### Badge count updates but messages don't appear
- ✅ Check conversation-specific filter in chat window
- ✅ Verify conversationId is correct
- ✅ Look for "Successfully subscribed" in console

#### Subscription not connecting
- ✅ Verify Supabase credentials (URL, ANON_KEY)
- ✅ Check network connectivity
- ✅ Look for WebSocket errors in Network tab
- ✅ Verify RLS policies don't block the subscription

## Performance Considerations

### Channel Naming

Use unique channel names to avoid conflicts:
- ✅ `messages:${conversationId}` - Scoped to conversation
- ✅ `messages_badge_${userId}` - Scoped to user
- ❌ `messages` - Too generic, causes conflicts

### Cleanup

Always clean up subscriptions:
```typescript
return () => {
  supabase.removeChannel(channel);
  if (pollingInterval) clearInterval(pollingInterval);
};
```

### Avoid Infinite Loops

Use ignore flags in fetch functions:
```typescript
let ignore = false;

async function fetchData() {
  if (ignore) return;
  // Fetch logic
}

return () => {
  ignore = true;
  // Cleanup
};
```

## Testing Real-time Functionality

### Manual Testing

1. **Open two browsers** (or one regular + one incognito)
2. **Log in as different users** in each browser
3. **Start a conversation** between the users
4. **Send a message** from User A
5. **Verify immediately appears** in User B's window (no refresh needed)
6. **Check badge counts** update on both sides
7. **Verify typing indicators** work (if implemented)

### Console Logging

Enable detailed logging by checking console for:
- Subscription status messages
- Payload data from database changes
- Fetch function calls
- Error messages

### Expected Console Output

```
Setting up real-time subscription for channel: messages:abc-123
Subscription status: SUBSCRIBED
Successfully subscribed to channel: messages:abc-123
Message change detected in navbar badge: { ... }
New message received via realtime: { ... }
```

## Migration Guide

If upgrading from older implementation:

1. **Run database migration**: `lib/fix-messages-schema.sql`
2. **Enable Realtime** for all message-related tables
3. **Update subscription code** to use consistent pattern
4. **Add status callbacks** for debugging
5. **Test thoroughly** with multiple users

## Summary

### Critical Setup Steps:
1. ✅ Enable Realtime for `messages` table in Supabase
2. ✅ Ensure `seen` and `seen_at` columns exist
3. ✅ Verify RLS policies allow SELECT for conversation participants
4. ✅ Use unique channel names per user/conversation
5. ✅ Always clean up subscriptions on unmount

### Files Modified:
- `components/chat/chat-window.tsx` - Message display
- `contexts/conversation-context.tsx` - Conversation list
- `components/navbar.tsx` - Desktop badge
- `components/mobile-nav.tsx` - Mobile badge
- `components/notification-dropdown.tsx` - Notifications

### Database Files:
- `lib/fix-messages-schema.sql` - Add required columns & enable Realtime
- `lib/run-fix-messages-schema.ts` - Node.js runner for migration
- `lib/fix-chat-rls.sql` - RLS policies for chat

For issues or questions, check the browser console logs and Supabase Dashboard logs.
