# 100% FREE Deployment Guide

## 🎯 Best Option: Vercel (Frontend) + Render (Backend)

**Cost: $0/month - Completely Free!**

---

## Option 1: Vercel + Render Free Tier ⭐ RECOMMENDED

### Why This?
- ✅ **100% Free** - No credit card needed
- ✅ **Easy setup** - 10 minutes
- ✅ **Automatic deployments**
- ⚠️ **Note**: Render free tier has cold starts (first request takes ~30 seconds, then fast)

### Step 1: Deploy Backend to Render (FREE)

1. **Sign Up**
   - Go to https://render.com
   - Sign up with GitHub (free)

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repo

3. **Configure Service**
   - **Name**: `onboarding-backend` (or any name)
   - **Region**: Choose closest to you
   - **Branch**: `main` (or your main branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable":
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=your-random-secret-key-here
   FRONTEND_URL=https://your-app.vercel.app
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_ANON_KEY=your-anon-key
   ```

   **Generate JWT_SECRET** (run locally):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Choose Free Plan**
   - Select "Free" plan (no credit card needed!)
   - Click "Create Web Service"

6. **Wait for Deployment**
   - First deployment takes ~5 minutes
   - Copy your backend URL (e.g., `https://onboarding-backend.onrender.com`)

### Step 2: Deploy Frontend to Vercel (FREE)

1. **Sign Up**
   - Go to https://vercel.com
   - Sign up with GitHub (free)

2. **Import Project**
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js

3. **Configure**
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js (auto)
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `.next` (auto)

4. **Add Environment Variable**
   ```
   NEXT_PUBLIC_API_URL=https://onboarding-backend.onrender.com/api
   ```
   (Use your actual Render backend URL)

5. **Deploy**
   - Click "Deploy"
   - Wait ~2 minutes
   - Get your URL: `https://your-app.vercel.app`

6. **Update Backend CORS**
   - Go back to Render
   - Update `FRONTEND_URL` to your Vercel URL
   - Render will auto-redeploy

**Done! Your app is live for FREE! 🎉**

---

## Option 2: Everything on Vercel (100% Free) ⚡

Convert backend to Vercel Serverless Functions - completely free!

### Pros:
- ✅ 100% Free
- ✅ Single deployment
- ✅ No cold starts
- ✅ Automatic scaling

### Cons:
- ⚠️ Requires refactoring backend code

**I can help convert your backend to Vercel API routes if you want this option!**

---

## Option 3: Railway Free Credit ($5/month)

Railway gives $5/month free credit - might be enough for small apps.

- Sign up: https://railway.app
- Free $5 credit every month
- Usually enough for small-medium apps
- If you exceed, they'll pause (not charge)

**Follow same steps as Option 1, but use Railway instead of Render**

---

## Option 4: Fly.io Free Tier

- **Free tier**: 3 shared VMs
- **Good for**: Small apps
- **Setup**: Slightly more complex

---

## Comparison Table

| Platform | Cost | Ease | Cold Starts | Best For |
|----------|------|------|-------------|----------|
| **Vercel** | Free | ⭐⭐⭐⭐⭐ | No | Frontend |
| **Render** | Free | ⭐⭐⭐⭐ | Yes (~30s) | Backend |
| **Railway** | $5 credit | ⭐⭐⭐⭐⭐ | No | Backend |
| **Fly.io** | Free tier | ⭐⭐⭐ | No | Full stack |

---

## Recommended: Vercel + Render

**Why?**
- ✅ 100% Free
- ✅ Easy setup
- ✅ No credit card needed
- ✅ Good documentation
- ⚠️ Only downside: Render has cold starts (first request slow)

**Cold Start Solution:**
- Use a "ping service" to keep it warm (free services available)
- Or upgrade to Render paid ($7/month) if needed later

---

## Quick Start (10 minutes)

### Backend on Render:
1. Sign up → New Web Service → Connect GitHub
2. Root: `backend`
3. Build: `npm install && npm run build`
4. Start: `npm start`
5. Add env vars → Deploy → Copy URL

### Frontend on Vercel:
1. Sign up → New Project → Connect GitHub
2. Root: `frontend`
3. Add `NEXT_PUBLIC_API_URL` → Deploy → Copy URL
4. Update backend `FRONTEND_URL` → Done!

---

## Free Tier Limits

### Render Free:
- ✅ 750 hours/month (enough for 24/7)
- ✅ Automatic sleep after 15 min inactivity
- ✅ Free SSL
- ⚠️ Cold starts (~30 seconds first request)

### Vercel Free:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Free SSL
- ✅ Perfect for Next.js

### Supabase Free:
- ✅ 500MB database
- ✅ 2GB bandwidth
- ✅ 50,000 monthly users
- ✅ Free SSL

**Total Cost: $0/month! 🎉**

---

## Need Help?

I can:
1. Walk you through Render + Vercel setup
2. Convert backend to Vercel serverless (100% free, no cold starts)
3. Help with any deployment issues
4. Set up a ping service to prevent cold starts

Which option do you prefer?
