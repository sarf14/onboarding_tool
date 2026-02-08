# Environment Variables Guide

## Frontend Environment Variables

Create `frontend/.env.local` file:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**For Production:**
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

**Note:** In Next.js, environment variables that start with `NEXT_PUBLIC_` are exposed to the browser. Never put sensitive keys here.

---

## Backend Environment Variables

Create `backend/.env` file:

```env
# Database Connection (PostgreSQL)
# For Supabase: Get from Settings > Database > Connection String
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Direct URL for connection pooling (Supabase)
# Use same as DATABASE_URL for local development
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# JWT Secret (Generate a secure random string)
# Use: openssl rand -base64 32
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"
```

**For Production:**
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
DIRECT_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="[GENERATE_SECURE_RANDOM_STRING]"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=production
FRONTEND_URL="https://your-frontend-domain.com"
```

---

## Required API Keys / Services

### 1. Database (Required)
**Option A: Supabase (Recommended)**
- Go to https://supabase.com
- Create account and project
- Get connection string from Settings > Database
- No API key needed, just connection string

**Option B: Local PostgreSQL**
- Install PostgreSQL locally
- Create database: `createdb onboarding_db`
- Use: `postgresql://postgres:password@localhost:5432/onboarding_db`

**Option C: Railway PostgreSQL**
- Go to https://railway.app
- Create PostgreSQL database
- Get connection string from database settings

### 2. JWT Secret (Required)
Generate a secure random string:
```bash
openssl rand -base64 32
```
Or use an online generator. This is used to sign JWT tokens.

### 3. Email Service (Optional - for mentor assignment notifications)
Email notifications are sent when mentors are assigned to mentees. If not configured, emails will be logged but not sent.

**SMTP Configuration:**
Add these to your `backend/.env`:
```env
SMTP_HOST=smtp.gmail.com          # Your SMTP server host
SMTP_PORT=587                     # SMTP port (587 for TLS, 465 for SSL)
SMTP_USER=your-email@gmail.com     # SMTP username/email
SMTP_PASSWORD=your-app-password    # SMTP password or app password
SMTP_FROM=noreply@autonex.com      # From email address (optional)
```

**Quick Setup Guides:**
- **Gmail:** Enable 2FA → Generate App Password → Use as SMTP_PASSWORD
- **Resend:** Sign up → Get API key → Use `resend` as SMTP_USER and API key as SMTP_PASSWORD
- **SendGrid:** Sign up → Create API key → Use `apikey` as SMTP_USER and API key as SMTP_PASSWORD
- **Mailgun:** Sign up → Get SMTP credentials → Use provided username/password
- **AWS SES:** Set up SES → Create SMTP credentials → Use provided username/password

**📖 For detailed step-by-step instructions, see [SMTP_CONFIGURATION_GUIDE.md](./SMTP_CONFIGURATION_GUIDE.md)**

**Note:** If SMTP is not configured, the system will still work but emails won't be sent (only logged to console).

### 4. File Storage (Optional - for reports/files)
If you want to store files:
- **AWS S3:** AWS Access Key ID and Secret
- **Cloudinary:** Cloud name, API Key, API Secret
- **Supabase Storage:** Included with Supabase account

---

## Quick Setup Guide

### Step 1: Database Setup (Choose one)

**Supabase (Easiest):**
1. Sign up at https://supabase.com
2. Create new project
3. Wait for database to be ready
4. Go to Settings > Database
5. Copy "Connection string" (URI format)
6. Paste into `backend/.env` as `DATABASE_URL`

**Local PostgreSQL:**
1. Install PostgreSQL
2. Create database: `createdb onboarding_db`
3. Use: `postgresql://postgres:yourpassword@localhost:5432/onboarding_db`

### Step 2: Generate JWT Secret
```bash
openssl rand -base64 32
```
Copy the output and paste into `backend/.env` as `JWT_SECRET`

### Step 3: Create Environment Files

**Frontend:**
```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env and add your DATABASE_URL and JWT_SECRET
```

### Step 4: Run Database Migrations
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed  # Creates default users
```

---

## Environment Variables Summary

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL

### Backend (.env)
- `DATABASE_URL` - PostgreSQL connection string ⚠️ REQUIRED
- `DIRECT_URL` - Direct database URL (same as DATABASE_URL for local)
- `JWT_SECRET` - Secret for signing tokens ⚠️ REQUIRED
- `JWT_EXPIRES_IN` - Token expiration (default: 7d)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS

---

## Security Notes

1. **Never commit .env files** - They're in .gitignore
2. **JWT_SECRET** - Must be strong and secret in production
3. **DATABASE_URL** - Contains password, keep secure
4. **NEXT_PUBLIC_*** - Only use for non-sensitive public values
5. **Production** - Use environment variables from hosting platform (Vercel, Railway, etc.)

---

## Testing Without Database

If you want to test the frontend without setting up database first:

1. Create `frontend/.env.local` with API URL
2. Start frontend: `npm run dev`
3. Frontend will try to connect to backend
4. Backend will fail without database, but you can see the UI

For full functionality, you need the database set up.
