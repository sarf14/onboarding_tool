# Onboarding Platform

A comprehensive 7-day onboarding platform for Autonex Annotation & QC Training.

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js 14 (React)
- **Styling:** Tailwind CSS
- **Language:** TypeScript

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (via Prisma ORM)
- **Language:** TypeScript

### Deployment
- **Frontend:** Vercel
- **Backend:** Railway or Render
- **Database:** Supabase PostgreSQL

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (local or Supabase)
- npm or yarn

## 🛠️ Setup Instructions

### 1. Clone Repository
```bash
git clone <repository-url>
cd onboarding-tool-project
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and JWT secret

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
```

## 🌐 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/onboarding_db"
JWT_SECRET="your-secret-key"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

## 📊 Database Setup

### Option 1: Local PostgreSQL
1. Install PostgreSQL
2. Create database: `createdb onboarding_db`
3. Update DATABASE_URL in backend/.env

### Option 2: Supabase (Recommended for Deployment)
1. Create account at https://supabase.com
2. Create new project
3. Get connection string from Settings > Database
4. Update DATABASE_URL in backend/.env

## 🚢 Deployment

See [DEPLOYMENT_SETUP.md](./DEPLOYMENT_SETUP.md) for detailed deployment instructions.

### Quick Deploy

**Frontend (Vercel):**
```bash
cd frontend
vercel deploy
```

**Backend (Railway):**
1. Connect GitHub repository
2. Add environment variables
3. Deploy

## 📁 Project Structure

```
onboarding-tool-project/
├── frontend/          # Next.js frontend
├── backend/           # Express.js backend
├── extracted/         # Extracted content from source
├── REQUIREMENTS.md    # Detailed requirements
├── DEPLOYMENT_SETUP.md # Deployment guide
└── README.md         # This file
```

## 🔑 Features

- ✅ User authentication (JWT)
- ✅ Role-based access (Trainee, Mentor, Admin)
- ✅ Progress tracking
- ✅ Quiz system
- ✅ Task management
- ✅ Mentor-Mentee assignment
- ✅ Reports generation
- ✅ Self-paced mode

## 📝 Development

### Running Migrations
```bash
cd backend
npm run prisma:migrate
```

### Viewing Database
```bash
cd backend
npm run prisma:studio
```

### Building for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## 📄 License

ISC
