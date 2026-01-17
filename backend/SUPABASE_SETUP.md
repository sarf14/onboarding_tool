# Supabase Setup Instructions

## 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Go to **Settings** > **API**
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (secret) → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Update `.env` File

Add these to your `backend/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
JWT_SECRET=oM9CqH9cFYlrEPuFP/YiaNa1Z8dbbRIM1gd9abJnMao=
PORT=5000
FRONTEND_URL=http://localhost:3000
```

## 3. Run Database Migration

1. Go to your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the contents of `backend/supabase/migrations/001_initial_schema.sql`
4. Paste and run it in the SQL Editor

## 4. Seed Initial Data (Optional)

You can create initial users manually through Supabase dashboard or use the API after starting the server.

## 5. Start the Backend

```bash
cd backend
npm run dev
```

That's it! No Prisma, no migrations, just Supabase! 🎉
