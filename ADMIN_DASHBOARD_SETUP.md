# Admin Dashboard Setup Guide

## Overview

The Admin Dashboard is a comprehensive CMS (Content Management System) for managing the Safety Shaper platform. It provides full control over users, posts, jobs, articles, companies, and more.

## Features

- ✅ **User Management** - View, search, and delete users
- ✅ **Posts Management** - Moderate and delete posts
- ✅ **Jobs Management** - Manage job listings
- ✅ **Articles Management** - Manage knowledge base articles
- ✅ **Companies Management** - Manage company pages
- ✅ **Analytics Dashboard** - View platform statistics and insights
- ✅ **Activity Log** - Track all admin actions
- ✅ **Modern UI** - Follows the same design system as the main site

## Database Setup

### 1. Run the Admin Schema SQL

Execute the SQL file to create the admin tables:

```sql
-- Run this file in your Supabase SQL editor
lib/admin-schema.sql
```

This will create:
- `admin_users` - Admin user accounts
- `admin_sessions` - Admin session management
- `admin_activity_log` - Activity tracking

### 2. Create Your First Admin User

**Important**: The default admin user in the schema uses a placeholder password hash. You need to:

1. **Option A: Use Supabase Dashboard**
   - Go to Supabase Dashboard → SQL Editor
   - Run this query (replace with your actual email and hashed password):

```sql
-- Generate a proper bcrypt hash for your password
-- You can use an online bcrypt generator or Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('your-password', 10);

INSERT INTO admin_users (email, password_hash, full_name, role)
VALUES (
  'your-email@example.com',
  '$2a$10$YOUR_BCRYPT_HASH_HERE', -- Replace with actual bcrypt hash
  'Admin Name',
  'super_admin'
);
```

2. **Option B: Use a Script** (Recommended for production)

Create a script to hash passwords properly:

```typescript
// scripts/create-admin.ts
import { hashPassword } from '@/lib/admin-auth';

async function createAdmin() {
  const email = 'admin@example.com';
  const password = 'your-secure-password';
  const hashedPassword = await hashPassword(password);
  
  // Insert into database
  console.log('Hashed password:', hashedPassword);
  // Then insert into admin_users table
}
```

### 3. Update Password Hashing (Production)

**CRITICAL**: The current implementation uses SHA-256 for password hashing, which is not secure for production. Update `lib/admin-auth.ts` to use bcrypt:

1. Install bcryptjs:
```bash
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

2. Update `lib/admin-auth.ts`:

```typescript
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

## Accessing the Admin Dashboard

1. Navigate to: `http://localhost:3000/admin-dashboard/login`
2. Enter your admin email and password
3. You'll be redirected to the dashboard

## Routes

- `/admin-dashboard` - Main dashboard with analytics
- `/admin-dashboard/login` - Admin login page
- `/admin-dashboard/users` - User management
- `/admin-dashboard/posts` - Posts management
- `/admin-dashboard/jobs` - Jobs management
- `/admin-dashboard/articles` - Articles management
- `/admin-dashboard/companies` - Companies management
- `/admin-dashboard/analytics` - Analytics (same as dashboard)
- `/admin-dashboard/activity` - Activity log

## API Endpoints

All admin API endpoints are prefixed with `/api/admin/`:

- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/auth/me` - Get current admin
- `POST /api/admin/auth/logout` - Admin logout
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/[id]` - Delete user
- `GET /api/admin/posts` - Get all posts
- `DELETE /api/admin/posts/[id]` - Delete post
- `GET /api/admin/jobs` - Get all jobs
- `DELETE /api/admin/jobs/[id]` - Delete job
- `GET /api/admin/articles` - Get all articles
- `DELETE /api/admin/articles/[id]` - Delete article
- `GET /api/admin/companies` - Get all companies
- `DELETE /api/admin/companies/[id]` - Delete company
- `GET /api/admin/activity` - Get activity log

## Security Features

1. **Separate Authentication System** - Admin users are separate from regular users
2. **Session Management** - Secure session tokens stored in HTTP-only cookies
3. **Activity Logging** - All admin actions are logged
4. **Middleware Protection** - All admin routes are protected
5. **Role-Based Access** - Support for different admin roles (admin, super_admin, moderator)

## Admin Roles

- `super_admin` - Full access to everything
- `admin` - Standard admin access
- `moderator` - Limited access (can be implemented for future features)

## Activity Logging

All admin actions are automatically logged to `admin_activity_log` table with:
- Admin user ID
- Action type (e.g., "delete_user", "delete_post")
- Resource type and ID
- IP address
- Timestamp

## Customization

### Adding New Management Pages

1. Create a new page in `app/admin-dashboard/[feature]/page.tsx`
2. Add API route in `app/api/admin/[feature]/route.ts`
3. Add navigation item in `components/admin/admin-sidebar.tsx`

### Styling

The admin dashboard uses the same design system as the main site:
- Tailwind CSS
- shadcn/ui components
- Same color scheme and typography

## Troubleshooting

### Can't Login
- Check that the admin user exists in `admin_users` table
- Verify password hash is correct (use bcrypt in production)
- Check browser console for errors
- Verify middleware is allowing `/admin-dashboard/login`

### Session Expires Too Quickly
- Default session duration is 7 days
- Update `createAdminSession` in `lib/admin-auth.ts` to change duration

### Activity Log Not Showing
- Check that `admin_activity_log` table exists
- Verify RLS policies allow admin access
- Check API route is returning data correctly

## Production Checklist

- [ ] Update password hashing to use bcrypt
- [ ] Change default admin password
- [ ] Set up proper environment variables
- [ ] Configure CORS if needed
- [ ] Set up monitoring for admin actions
- [ ] Review and test all delete operations
- [ ] Set up backup for admin_users table
- [ ] Configure rate limiting for admin routes
- [ ] Set up audit logging
- [ ] Test all management pages

## Support

For issues or questions about the admin dashboard, check:
- Database schema: `lib/admin-schema.sql`
- Authentication: `lib/admin-auth.ts`
- Context: `contexts/admin-context.tsx`
- Middleware: `middleware.ts`

---

**Note**: This is a separate CMS system from the main application. Admin users are completely separate from regular platform users.

