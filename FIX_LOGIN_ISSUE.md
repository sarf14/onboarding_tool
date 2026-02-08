# 🔧 Fix Login 401 Error

## Problem
Getting 401 (Unauthorized) errors when trying to login. This happens because existing users in the database still have old credentials.

## Solution

### Step 1: Update Existing Users

Run the update script to change all users to the new credentials:

```bash
cd backend
npx ts-node scripts/update-user-credentials.ts
```

This will:
- Update `Admin User` → `admin` (password: `admin`)
- Update all annotator names to `annotator{ID}` format
- Update all passwords to just the ID number

### Step 2: Check Backend Logs

After running the update script, check your backend console. You should see:
- ✅ Success messages for each updated user
- ⚠️ Warnings for users not found (if any)

### Step 3: Verify Login

Try logging in with:
- **Name:** `admin`
- **Password:** `admin`

Or for an annotator:
- **Name:** `annotator11`
- **Password:** `11`

## Alternative: Delete and Recreate Users

If the update script doesn't work, you can delete all users and recreate them:

### Option A: Via Admin Panel (if you can login)
1. Login with old credentials (if still available)
2. Go to Admin Panel
3. Delete all users
4. Run: `npx ts-node scripts/create-test-users.ts`

### Option B: Via Database Directly
1. Connect to your Supabase/PostgreSQL database
2. Delete all users: `DELETE FROM users;`
3. Run: `npx ts-node scripts/create-test-users.ts`

## Debugging

The login endpoint now has debug logs. Check your backend console for:
- `Login attempt:` - Shows what name/password was sent
- `User lookup error:` - If user not found
- `User found:` - Confirms user exists
- `Password verification result:` - Shows if password matches

## Common Issues

1. **Case Sensitivity**: Make sure you're using exact case:
   - ✅ `admin` (lowercase)
   - ❌ `Admin` or `ADMIN`

2. **User Doesn't Exist**: Run the update script first

3. **Password Mismatch**: The update script should fix this, but verify:
   - Admin password should be: `admin` (not `admin123`)
   - Annotator passwords should be just the number: `11`, `38`, etc.

4. **Database Connection**: Make sure your backend can connect to the database

## Quick Test

After updating, test with these exact credentials:

**Admin:**
- Name: `admin`
- Password: `admin`

**Annotator:**
- Name: `annotator11`
- Password: `11`

If these don't work, check the backend console logs for the debug messages.
