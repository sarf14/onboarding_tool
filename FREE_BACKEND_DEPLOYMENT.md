# Free Backend Deployment Options

Since Railway's free plan only allows databases, here are **free alternatives** to deploy your backend:

---

## Option 1: Render (Recommended - FREE) ⭐

**Render offers a free tier** that's perfect for backend deployment.

### Step-by-Step Guide

#### 1. Sign Up
- Go to https://render.com
- Sign up with GitHub (free)

#### 2. Create New Web Service
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Select your repository

#### 3. Configure Service
- **Name**: `onboarding-backend` (or any name)
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`
- **Plan**: `Free` (select Free tier)

#### 4. Set Environment Variables
Click "Advanced" → "Add Environment Variable" and add:

```env
NODE_ENV=production
PORT=10000
JWT_SECRET=<generate with: openssl rand -base64 32>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend.vercel.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<from Supabase>
SUPABASE_ANON_KEY=<from Supabase>
LLM_API_KEY=<your DeepSeek API key>
LLM_API_URL=https://api.deepseek.com/chat/completions
LLM_MODEL=deepseek-chat
```

**Important**: Render free tier uses port `10000`, but your code should use `process.env.PORT` (which Render sets automatically).

#### 5. Deploy
- Click "Create Web Service"
- Render will build and deploy automatically
- Your backend URL will be: `https://onboarding-backend.onrender.com`

#### 6. Update Frontend
- In Vercel, set: `NEXT_PUBLIC_API_URL=https://onboarding-backend.onrender.com/api`
- **Important**: Include `/api` at the end!

### Render Free Tier Notes
- ✅ **Free forever**
- ⚠️ **Auto-sleeps** after 15 minutes of inactivity
- ⚠️ **Cold start** takes ~30 seconds after sleep
- ✅ Perfect for development and small projects
- ✅ No credit card required

---

## Option 2: Fly.io (FREE)

Fly.io offers a free tier with generous limits.

### Quick Setup

1. **Install Fly CLI**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   
   # Or download from: https://fly.io/docs/getting-started/installing-flyctl/
   ```

2. **Login**
   ```bash
   fly auth login
   ```

3. **Initialize**
   ```bash
   cd backend
   fly launch
   ```
   - Follow prompts
   - Select region
   - Don't deploy yet

4. **Create fly.toml** (if not auto-generated)
   ```toml
   app = "onboarding-backend"
   primary_region = "iad"
   
   [build]
     builder = "paketobuildpacks/builder:base"
   
   [http_service]
     internal_port = 5000
     force_https = true
     auto_stop_machines = true
     auto_start_machines = true
     min_machines_running = 0
     processes = ["app"]
   
   [[services]]
     http_checks = []
     internal_port = 5000
     processes = ["app"]
     protocol = "tcp"
     script_checks = []
   
     [services.concurrency]
       hard_limit = 25
       soft_limit = 20
       type = "connections"
   
     [[services.ports]]
       force_https = true
       handlers = ["http"]
       port = 80
   
     [[services.ports]]
       handlers = ["tls", "http"]
       port = 443
   
     [[services.tcp_checks]]
       grace_period = "1s"
       interval = "15s"
       restart_limit = 0
       timeout = "2s"
   ```

5. **Set Secrets**
   ```bash
   fly secrets set JWT_SECRET="your-secret"
   fly secrets set SUPABASE_URL="https://your-project.supabase.co"
   fly secrets set SUPABASE_SERVICE_ROLE_KEY="your-key"
   fly secrets set SUPABASE_ANON_KEY="your-key"
   fly secrets set LLM_API_KEY="your-key"
   fly secrets set FRONTEND_URL="https://your-frontend.vercel.app"
   fly secrets set NODE_ENV="production"
   ```

6. **Deploy**
   ```bash
   fly deploy
   ```

### Fly.io Free Tier
- ✅ **3 shared-cpu-1x VMs free**
- ✅ **3GB persistent volumes free**
- ✅ **160GB outbound data transfer free**
- ✅ No credit card required (for free tier)

---

## Option 3: Cyclic.sh (FREE)

Cyclic is another free option for Node.js backends.

### Quick Setup

1. **Sign Up**
   - Go to https://cyclic.sh
   - Sign up with GitHub

2. **Deploy**
   - Click "New App"
   - Select your GitHub repository
   - Set root directory to `backend`
   - Cyclic auto-detects Node.js

3. **Environment Variables**
   - Add all required variables in dashboard

4. **Deploy**
   - Automatic deployment
   - Get URL: `https://your-app.cyclic.app`

---

## Option 4: Koyeb (FREE)

Koyeb offers a free tier for backend deployment.

### Quick Setup

1. **Sign Up**
   - Go to https://www.koyeb.com
   - Sign up with GitHub

2. **Create App**
   - Click "Create App"
   - Select GitHub repository
   - Set root directory: `backend`
   - Build: `npm run build`
   - Run: `npm start`

3. **Environment Variables**
   - Add all required variables

4. **Deploy**
   - Automatic deployment

---

## Option 5: Railway (Paid - $5/month)

If you want to use Railway, you need to upgrade:

1. **Upgrade Railway Plan**
   - Go to Railway dashboard
   - Click "Upgrade"
   - Choose "Developer" plan ($5/month)
   - Add payment method

2. **Then follow Railway deployment guide**

---

## Comparison Table

| Platform | Free Tier | Auto-Sleep | Cold Start | Best For |
|----------|-----------|------------|------------|----------|
| **Render** | ✅ Yes | ⚠️ Yes (15 min) | ~30s | Development, Small apps |
| **Fly.io** | ✅ Yes | ⚠️ Yes | ~5s | Production-ready |
| **Cyclic** | ✅ Yes | ⚠️ Yes | ~10s | Simple deployments |
| **Koyeb** | ✅ Yes | ⚠️ Yes | ~10s | Global distribution |
| **Railway** | ❌ No (DB only) | ❌ No | N/A | Paid plans only |

---

## Recommended: Render (Free)

**Why Render?**
- ✅ Completely free
- ✅ Easy setup (similar to Railway)
- ✅ Your project already has `render.yaml` config
- ✅ No credit card required
- ✅ Good documentation

**Steps:**
1. Sign up at https://render.com
2. Create Web Service
3. Connect GitHub repo
4. Set root directory: `backend`
5. Add environment variables
6. Deploy!

---

## Quick Render Setup Checklist

- [ ] Render account created
- [ ] GitHub repository connected
- [ ] Web Service created
- [ ] Root directory set to `backend`
- [ ] Build command: `npm ci && npm run build`
- [ ] Start command: `npm start`
- [ ] Plan: Free tier selected
- [ ] All environment variables added
- [ ] Deployment successful
- [ ] Backend URL copied
- [ ] Frontend `NEXT_PUBLIC_API_URL` updated
- [ ] Health endpoint tested: `https://your-app.onrender.com/api/health`

---

## Environment Variables for Render

```env
NODE_ENV=production
PORT=10000
JWT_SECRET=<generate-secret>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend.vercel.app
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-key>
SUPABASE_ANON_KEY=<your-key>
LLM_API_KEY=<your-deepseek-key>
LLM_API_URL=https://api.deepseek.com/chat/completions
LLM_MODEL=deepseek-chat
```

---

## After Deployment

1. **Get your backend URL**
   - Render: `https://your-app.onrender.com`
   - Fly.io: `https://your-app.fly.dev`
   - Cyclic: `https://your-app.cyclic.app`

2. **Update Frontend**
   - In Vercel, set: `NEXT_PUBLIC_API_URL=https://your-backend-url/api`
   - **Important**: Include `/api` at the end!

3. **Update Backend CORS**
   - Set `FRONTEND_URL` to your Vercel frontend URL

4. **Test**
   ```bash
   curl https://your-backend-url/api/health
   ```

---

## Need Help?

If you encounter issues with any platform:

1. Check deployment logs
2. Verify environment variables
3. Test health endpoint
4. Check CORS configuration
5. Review error messages

**Recommendation**: Start with **Render** - it's the easiest and most similar to Railway!
