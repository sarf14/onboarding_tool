# Quick Start - Supabase Setup

## ✅ Step 1: Credentials Added
Your Supabase credentials have been added to `.env`:
- URL: `https://wonwqeovmnwikofnewjv.supabase.co`
- API Key: Added (publishable key)

## ⚠️ Important: Get Service Role Key
For backend operations, you need the **service_role** key (not publishable):
1. Go to: https://wonwqeovmnwikofnewjv.supabase.co
2. Navigate to: **Settings** → **API**
3. Copy the **service_role** key (it's secret, starts with `eyJ...`)
4. Update `backend/.env`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

## 📊 Step 2: Create Database Tables
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/wonwqeovmnwikofnewjv
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy ALL contents from: `backend/supabase/migrations/001_initial_schema.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)

## 🚀 Step 3: Start Backend
```bash
cd backend
npm run dev
```

## ✅ Step 4: Test Connection
Once backend is running, test:
```bash
curl http://localhost:5000/api/health
```

You should see: `{"status":"ok","database":"connected"}`

---

**Note**: The publishable key you provided might work for some operations, but for full backend access (creating users, bypassing RLS), you'll need the service_role key.
