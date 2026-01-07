# Quick Admin Setup Guide

## Step 1: Run Database Schema

Go to Supabase Dashboard → SQL Editor and run:

```sql
-- Copy and paste the entire contents of lib/admin-schema.sql
```

## Step 2: Create Admin User

### Option A: Use Debug Endpoint (Easiest)

1. Open your browser console or use curl:

```bash
# Check if tables exist
curl http://localhost:3000/api/admin/debug

# Create admin user
curl -X POST http://localhost:3000/api/admin/debug \
  -H "Content-Type: application/json" \
  -d '{"action":"create","email":"admin@example.com","password":"admin123"}'
```

Or use the browser console:

```javascript
// Check setup
fetch('/api/admin/debug').then(r => r.json()).then(console.log)

// Create admin user
fetch('/api/admin/debug', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    action: 'create',
    email: 'admin@example.com',
    password: 'admin123'
  })
}).then(r => r.json()).then(console.log)
```

### Option B: Use SQL Directly

1. Generate password hash using Node.js:

```javascript
const crypto = require('crypto');
const password = 'admin123';
const hash = crypto.createHash('sha256').update(password).digest('hex');
console.log(hash);
```

2. Insert into database:

```sql
INSERT INTO admin_users (email, password_hash, full_name, role)
VALUES (
  'admin@example.com',
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', -- hash for 'admin123'
  'Administrator',
  'super_admin'
) ON CONFLICT (email) DO UPDATE 
SET password_hash = EXCLUDED.password_hash;
```

### Option C: Use the Create User API

```bash
curl -X POST http://localhost:3000/api/admin/create-user \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: your-secret" \
  -d '{"email":"admin@example.com","password":"admin123","full_name":"Admin"}'
```

## Step 3: Test Login

1. Go to: `http://localhost:3000/admin-dashboard/login`
2. Use the email and password you created
3. You should be redirected to the dashboard

## Troubleshooting

### 401 Unauthorized Error

- Check if admin user exists: `GET /api/admin/debug`
- Verify password hash matches
- Check server logs for detailed error messages

### "Table does not exist" Error

- Run the SQL schema in Supabase
- Check that all tables were created

### Password Not Working

1. Generate a new hash for your password:

```bash
curl -X POST http://localhost:3000/api/admin/debug \
  -H "Content-Type: application/json" \
  -d '{"action":"hash","password":"your-password"}'
```

2. Update the user in database with the new hash

### Check Current Setup

```bash
# See what's in the database
curl http://localhost:3000/api/admin/debug
```

## Default Test Credentials

After setup, you can use:
- Email: `admin@example.com`
- Password: `admin123`

**⚠️ Change these in production!**

## Next Steps

1. ✅ Create admin user
2. ✅ Test login
3. ✅ Change default password
4. ✅ Remove debug endpoints in production
5. ✅ Switch to bcrypt for password hashing

