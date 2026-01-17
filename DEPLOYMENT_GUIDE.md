# Deployment Guide - Onboarding Tool

This guide covers multiple deployment options for your onboarding platform.

## Architecture Overview

- **Frontend**: Next.js (React)
- **Backend**: Express.js (Node.js/TypeScript)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT tokens

---

## Option 1: Vercel (Frontend) + Railway (Backend) - RECOMMENDED ⭐

### Why This Option?
- ✅ **Vercel**: Perfect for Next.js, free tier, automatic deployments
- ✅ **Railway**: Easy backend deployment, $5/month free credit
- ✅ **Simple setup**, great performance

### Step 1: Deploy Backend to Railway

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `backend` folder

3. **Configure Environment Variables**
   In Railway dashboard, add these environment variables:
   ```
   PORT=5000
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-change-this
   FRONTEND_URL=https://your-frontend.vercel.app
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Set Build Command**
   - Build Command: `npm run build`
   - Start Command: `npm start`

5. **Deploy**
   - Railway will automatically deploy
   - Note your backend URL (e.g., `https://your-backend.up.railway.app`)

### Step 2: Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the `frontend` folder

3. **Configure Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - You'll get a URL like `https://your-app.vercel.app`

5. **Update Backend CORS**
   - Go back to Railway
   - Update `FRONTEND_URL` to your Vercel URL
   - Redeploy backend

### Step 3: Update Frontend API URL
- Your frontend will automatically use `NEXT_PUBLIC_API_URL`
- No code changes needed!

---

## Option 2: Vercel (Frontend) + Render (Backend)

### Deploy Backend to Render

1. **Create Render Account**
   - Go to https://render.com
   - Sign up

2. **Create New Web Service**
   - Connect GitHub repository
   - Select `backend` folder
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Environment Variables**
   ```
   PORT=10000
   NODE_ENV=production
   JWT_SECRET=your-secret-key
   FRONTEND_URL=https://your-frontend.vercel.app
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-key
   SUPABASE_ANON_KEY=your-key
   ```

4. **Deploy Frontend** (same as Option 1)

---

## Option 3: Full Stack on Railway

Deploy both frontend and backend on Railway.

### Backend (same as Option 1)

### Frontend on Railway
1. Create new service in Railway
2. Select `frontend` folder
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Environment Variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
   ```

---

## Option 4: Docker Deployment (Advanced)

### Create Dockerfile for Backend

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

### Create Dockerfile for Frontend

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "start"]
```

Then deploy to:
- Railway (supports Docker)
- Render (supports Docker)
- Fly.io (supports Docker)
- AWS/GCP/Azure

---

## Option 5: Vercel Full-Stack (Next.js API Routes)

Convert backend to Next.js API routes and deploy everything on Vercel.

**Pros**: Single deployment, simpler
**Cons**: Requires refactoring backend code

---

## Quick Start: Recommended Setup

### 1. Backend on Railway (5 minutes)
```bash
# In Railway dashboard:
1. New Project → GitHub → Select backend folder
2. Add environment variables
3. Deploy
4. Copy backend URL
```

### 2. Frontend on Vercel (5 minutes)
```bash
# In Vercel dashboard:
1. New Project → GitHub → Select frontend folder
2. Add NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
3. Deploy
4. Done!
```

---

## Environment Variables Checklist

### Backend (.env)
```
PORT=5000
NODE_ENV=production
JWT_SECRET=generate-a-strong-random-secret-here
FRONTEND_URL=https://your-frontend.vercel.app
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
```

---

## Post-Deployment Checklist

- [ ] Backend is accessible (test: `https://your-backend.up.railway.app/api/health`)
- [ ] Frontend can reach backend (check browser console)
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] Database connection works
- [ ] Authentication works
- [ ] Users can log in
- [ ] All features work

---

## Cost Estimate

### Free Tier Option:
- **Vercel**: Free (hobby plan)
- **Railway**: $5/month credit (usually enough for small apps)
- **Supabase**: Free tier (generous limits)
- **Total**: ~$0-5/month

### Paid Option (if needed):
- **Vercel Pro**: $20/month (if you need more)
- **Railway**: Pay-as-you-go after free credit
- **Total**: ~$20-50/month

---

## Troubleshooting

### Backend not accessible?
- Check Railway logs
- Verify PORT is set correctly
- Check environment variables

### Frontend can't reach backend?
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in backend
- Check browser console for errors

### Database connection issues?
- Verify Supabase credentials
- Check Supabase project is active
- Verify network access

---

## Need Help?

I can help you:
1. Set up deployment configs
2. Create Dockerfiles
3. Configure environment variables
4. Debug deployment issues

Just let me know which option you prefer!
