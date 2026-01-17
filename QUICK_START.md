# Quick Start Guide

## ✅ No API Keys Required!

This application **does NOT need any external API keys**. You only need:

1. **Database connection** (free Supabase account OR local PostgreSQL)
2. **JWT Secret** (you generate this yourself - it's just a random string)

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Environment Files

**Frontend (.env.local):**
```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

**Backend (.env):**
```bash
cd backend
cp .env.example .env
# Then edit .env and add your DATABASE_URL and JWT_SECRET
```

### Step 2: Get Database (Choose One)

**Option A: Supabase (Free & Easy - Recommended)**
1. Go to https://supabase.com
2. Sign up (free)
3. Create new project
4. Wait 2 minutes for setup
5. Go to Settings > Database
6. Copy "Connection string" (looks like: `postgresql://postgres:xxx@xxx.supabase.co:5432/postgres`)
7. Paste into `backend/.env` as `DATABASE_URL`

**Option B: Local PostgreSQL**
1. Install PostgreSQL
2. Create database: `createdb onboarding_db`
3. Use: `postgresql://postgres:yourpassword@localhost:5432/onboarding_db`

### Step 3: Generate JWT Secret

```bash
# Windows (Git Bash)
openssl rand -base64 32

# Or use online generator: https://randomkeygen.com/
```

Copy the output and paste into `backend/.env` as `JWT_SECRET`

### Step 4: Install & Run

```bash
# Backend
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Step 5: Login

Open http://localhost:3000

**Default Users:**
- Admin: `admin@onboarding.com` / `admin123`
- Mentor: `mentor@onboarding.com` / `mentor123`
- Trainee: `trainee@onboarding.com` / `trainee123`

---

## 📋 Environment Variables Checklist

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
✅ **Only 1 variable needed!**

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://...          # ⚠️ REQUIRED
JWT_SECRET=your-random-string-here    # ⚠️ REQUIRED
PORT=5000                              # Optional (default)
FRONTEND_URL=http://localhost:3000     # Optional (default)
```
✅ **Only 2 required variables!**

---

## 🔑 What You DON'T Need

- ❌ No Google API keys
- ❌ No AWS keys
- ❌ No payment API keys
- ❌ No third-party service keys
- ❌ No OpenAI API keys
- ❌ No external API keys at all!

---

## 🆘 Troubleshooting

**"Cannot find module" errors:**
```bash
cd backend && npm install
cd frontend && npm install
```

**Database connection error:**
- Check DATABASE_URL in backend/.env
- Make sure database is running
- Verify credentials

**Frontend can't connect:**
- Check NEXT_PUBLIC_API_URL in frontend/.env.local
- Make sure backend is running on port 5000
- Check browser console for errors

---

## 📝 Example .env Files

### `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### `backend/.env`
```env
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
JWT_SECRET=abc123xyz789randomstring456
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

That's it! No API keys needed! 🎉
