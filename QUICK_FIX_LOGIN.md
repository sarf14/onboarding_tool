# 🚨 Quick Fix: Login 401 Error

## The Problem
Error: "Cannot coerce the result to a single JSON object" means **no user exists** with the name you're trying to login with.

## Solution: Update Users in Database

You need to update existing users to use the new credentials. Run this command:

```bash
cd backend
npx ts-node scripts/update-user-credentials.ts
```

This script will:
1. Find users with old names (like "Admin User", "Akansha", etc.)
2. Update them to new names (like "admin", "annotator11", etc.)
3. Update passwords to the new format

## After Running the Script

Try logging in with:
- **Name:** `admin`
- **Password:** `admin`

## If Script Doesn't Work

### Option 1: Check What Users Exist

Connect to your database and check:
```sql
SELECT name FROM users LIMIT 10;
```

This will show you what user names actually exist.

### Option 2: Create Users Fresh

If you want to start fresh:

1. **Delete all users** (via database or admin panel if accessible)
2. **Run create script:**
   ```bash
   cd backend
   npx ts-node scripts/create-test-users.ts
   ```

### Option 3: Manual Database Update

If you have database access, you can manually update:

```sql
-- Update admin
UPDATE users SET name = 'admin', password = '$2a$10$...' WHERE name = 'Admin User';
-- (You'll need to hash the password 'admin' first)

-- Update annotators
UPDATE users SET name = 'annotator11', password = '$2a$10$...' WHERE name = 'Akansha';
-- etc...
```

But it's easier to use the update script!

## Check Backend Logs

After trying to login, check your backend console. You should now see:
- `User not found with name: admin`
- `Available users in database: [...]` (shows first 10 user names)

This will help you see what names actually exist in your database.
