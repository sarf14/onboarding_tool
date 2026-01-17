# 🚀 Deploy Now - Step by Step Guide

## Prerequisites Checklist

- [ ] GitHub account (free)
- [ ] Render account (free) - https://render.com
- [ ] Vercel account (free) - https://vercel.com
- [ ] Supabase credentials ready
- [ ] Code pushed to GitHub

---

## STEP 1: Push Code to GitHub (5 minutes)

### 1.1 Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `onboarding-tool` (or any name)
3. Make it **Private** (recommended) or Public
4. Click "Create repository"
5. **Copy the repository URL** (you'll need it)

### 1.2 Push Your Code
Run these commands in your terminal:

```bash
# Navigate to project root
cd C:\Users\Sarfaraz\Desktop\onboarding-tool-project

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for deployment"

# Add remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## STEP 2: Deploy Backend to Render (10 minutes)

### 2.1 Create Render Account
1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended)

### 2.2 Create Web Service
1. Click "New +" → "Web Service"
2. Click "Connect GitHub" (if not connected)
3. Authorize Render to access your repositories
4. Select your repository
5. Click "Connect"

### 2.3 Configure Backend Service
Fill in these settings:

- **Name**: `onboarding-backend`
- **Region**: Choose closest (e.g., `Oregon (US West)`)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: Select **FREE**

### 2.4 Add Environment Variables
Click "Advanced" → "Add Environment Variable" and add:

```
NODE_ENV = production
PORT = 10000
JWT_SECRET = [generate below]
FRONTEND_URL = https://your-app.vercel.app [update after frontend deploy]
SUPABASE_URL = [your supabase url]
SUPABASE_SERVICE_ROLE_KEY = [your service role key]
SUPABASE_ANON_KEY = [your anon key]
```

**Generate JWT_SECRET:**
```bash
cd backend
node scripts/generate-secret.js
```
Copy the output and use it as JWT_SECRET.

### 2.5 Deploy
1. Click "Create Web Service"
2. Wait ~5 minutes for first deployment
3. **Copy your backend URL** (e.g., `https://onboarding-backend.onrender.com`)

### 2.6 Test Backend
```bash
curl https://your-backend.onrender.com/api/health
```
Should return: `{"status":"ok",...}`

---

## STEP 3: Deploy Frontend to Vercel (5 minutes)

### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign Up"
3. Sign up with GitHub

### 3.2 Import Project
1. Click "Add New Project"
2. Select your GitHub repository
3. Click "Import"

### 3.3 Configure Frontend
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `frontend` ⚠️ IMPORTANT!
- **Build Command**: `npm run build` (auto)
- **Output Directory**: `.next` (auto)

### 3.4 Add Environment Variable
Click "Environment Variables" → Add:

```
NEXT_PUBLIC_API_URL = https://your-backend.onrender.com/api
```
(Use your actual Render backend URL)

### 3.5 Deploy
1. Click "Deploy"
2. Wait ~2-3 minutes
3. **Copy your frontend URL** (e.g., `https://your-app.vercel.app`)

### 3.6 Update Backend CORS
1. Go back to Render dashboard
2. Click on your backend service
3. Go to "Environment" tab
4. Update `FRONTEND_URL` to your Vercel URL
5. Render will auto-redeploy

---

## STEP 4: Test Everything ✅

1. Visit your Vercel URL
2. Try logging in with:
   - Email: `admin@test.com`
   - Password: `admin123`
3. Test all features:
   - [ ] Login works
   - [ ] Dashboard loads
   - [ ] Sections accessible
   - [ ] Quizzes work
   - [ ] Admin panel accessible
   - [ ] Mentor dashboard works (if you have mentors)

---

## 🎉 Done! Your App is Live!

**Frontend**: `https://your-app.vercel.app`  
**Backend**: `https://your-backend.onrender.com`

---

## 📝 Quick Reference

### Backend URL Format:
- Render: `https://onboarding-backend.onrender.com`
- API Base: `https://onboarding-backend.onrender.com/api`

### Frontend URL Format:
- Vercel: `https://your-app-name.vercel.app`

### Environment Variables Needed:

**Backend (Render):**
- `NODE_ENV=production`
- `PORT=10000`
- `JWT_SECRET=<generated-secret>`
- `FRONTEND_URL=<vercel-url>`
- `SUPABASE_URL=<your-url>`
- `SUPABASE_SERVICE_ROLE_KEY=<your-key>`
- `SUPABASE_ANON_KEY=<your-key>`

**Frontend (Vercel):**
- `NEXT_PUBLIC_API_URL=<render-backend-url>/api`

---

## 🆘 Troubleshooting

### Backend not starting?
- Check Render logs
- Verify all environment variables are set
- Check build succeeded

### Frontend can't reach backend?
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend is running
- Check CORS settings

### Need help?
I can guide you through any step!
