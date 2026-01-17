# Quick Setup Instructions

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or Supabase account)

## Step-by-Step Setup

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Set Up Database

**Option A: Supabase (Recommended)**
1. Go to https://supabase.com and create account
2. Create new project
3. Go to Settings > Database
4. Copy the "Connection string" (URI format)
5. It looks like: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

**Option B: Local PostgreSQL**
1. Install PostgreSQL
2. Create database: `createdb onboarding_db`
3. Connection string: `postgresql://postgres:yourpassword@localhost:5432/onboarding_db`

### 3. Configure Environment Variables

**Backend:**
```bash
cd backend
# Copy example file
cp .env.example .env

# Edit .env file and add:
# - DATABASE_URL (from step 2)
# - JWT_SECRET (generate with: openssl rand -base64 32)
```

**Frontend:**
```bash
cd frontend
# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

### 4. Set Up Database Schema

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations (creates tables)
npm run prisma:migrate

# Seed database (creates default users)
npm run prisma:seed
```

### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:3000

### 6. Test the Application

1. Open http://localhost:3000
2. You'll be redirected to login
3. Use default credentials:
   - **Admin:** admin@onboarding.com / admin123
   - **Mentor:** mentor@onboarding.com / mentor123
   - **Trainee:** trainee@onboarding.com / trainee123

---

## Troubleshooting

### Database Connection Error
- Check DATABASE_URL in backend/.env
- Make sure database is running (if local)
- Verify credentials are correct

### Frontend Can't Connect to Backend
- Check NEXT_PUBLIC_API_URL in frontend/.env.local
- Make sure backend is running on port 5000
- Check CORS settings in backend

### Port Already in Use
- Change PORT in backend/.env
- Update NEXT_PUBLIC_API_URL in frontend/.env.local

---

## Required Environment Variables Checklist

### Backend (.env)
- [ ] DATABASE_URL (PostgreSQL connection string)
- [ ] JWT_SECRET (random secure string)
- [ ] PORT (default: 5000)
- [ ] FRONTEND_URL (default: http://localhost:3000)

### Frontend (.env.local)
- [ ] NEXT_PUBLIC_API_URL (default: http://localhost:5000/api)

---

## No API Keys Needed!

This application doesn't require any external API keys. You only need:
1. **Database connection** (Supabase is free)
2. **JWT secret** (you generate this yourself)

That's it! No third-party API keys required.
