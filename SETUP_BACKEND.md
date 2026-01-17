# Backend Setup - Quick Fix

## ⚠️ Backend Needs Database Configuration

The backend requires a `DATABASE_URL` in `backend/.env` file.

### Quick Setup Options:

#### Option 1: Use Supabase (Free - Recommended)

1. Go to https://supabase.com
2. Sign up (free account)
3. Create new project
4. Wait 2 minutes for setup
5. Go to **Settings > Database**
6. Copy the **Connection string** (URI format)
7. It looks like: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

8. Edit `backend/.env` and add:
```env
DATABASE_URL="postgresql://postgres:yourpassword@db.xxx.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:yourpassword@db.xxx.supabase.co:5432/postgres"
JWT_SECRET="oM9CqH9cFYlrEPuFP/YiaNa1Z8dbbRIM1gd9abJnMao="
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

#### Option 2: Local PostgreSQL

1. Install PostgreSQL
2. Create database: `createdb onboarding_db`
3. Edit `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/onboarding_db"
DIRECT_URL="postgresql://postgres:yourpassword@localhost:5432/onboarding_db"
JWT_SECRET="oM9CqH9cFYlrEPuFP/YiaNa1Z8dbbRIM1gd9abJnMao="
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

### After Setting Up .env:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

---

## Current Status

✅ **Frontend:** Running on http://localhost:3000
❌ **Backend:** Needs DATABASE_URL in backend/.env

Once you add DATABASE_URL to backend/.env, run:
```bash
cd backend
npm run dev
```

Then both servers will be running!
