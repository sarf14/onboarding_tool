# Deployment Setup Guide

## Recommended Tech Stack for Deployment

### Database
- **Production:** Supabase (PostgreSQL) or Railway PostgreSQL
- **Development:** Local PostgreSQL or Docker

### Backend Hosting
- **Recommended:** Railway, Render, or Vercel (Serverless Functions)
- **Alternative:** AWS EC2, DigitalOcean

### Frontend Hosting
- **Recommended:** Vercel (optimized for Next.js)
- **Alternative:** Netlify, AWS Amplify

### Storage (for reports/files)
- **Recommended:** AWS S3 or Cloudinary
- **Alternative:** Supabase Storage

---

## Environment Variables Setup

### Backend (.env)
```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# JWT
JWT_SECRET="[GENERATE_SECURE_RANDOM_STRING]"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL="https://your-domain.vercel.app"

# Email (Optional - for notifications)
SMTP_HOST="smtp.resend.com"
SMTP_PORT=587
SMTP_USER="resend"
SMTP_PASS="[RESEND_API_KEY]"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="https://your-api.railway.app"
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
```

---

## Step-by-Step Deployment

### 1. Database Setup (Supabase - Recommended)

1. Go to https://supabase.com
2. Create a new project
3. Get your database URL from Settings > Database
4. Copy the connection string to backend/.env

### 2. Backend Deployment (Railway)

1. Push code to GitHub
2. Go to https://railway.app
3. New Project > Deploy from GitHub
4. Select your repository
5. Add environment variables
6. Deploy

### 3. Frontend Deployment (Vercel)

1. Push code to GitHub
2. Go to https://vercel.com
3. Import Project from GitHub
4. Configure environment variables
5. Deploy

---

## Database Migration Commands

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```
