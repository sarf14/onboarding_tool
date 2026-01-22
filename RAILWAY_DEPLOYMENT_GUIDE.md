# Railway Deployment Guide - Step by Step

⚠️ **IMPORTANT**: Railway's free plan only allows deploying **databases**, not web services. To deploy your backend on Railway, you need to upgrade to a paid plan ($5/month minimum).

**For FREE backend deployment, see `FREE_BACKEND_DEPLOYMENT.md`** - We recommend **Render** (completely free) as an alternative.

---

This guide will walk you through deploying your backend to Railway (requires paid plan).

## Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Railway Account** - Sign up at https://railway.app (requires paid plan for web services)
3. **Supabase Account** - For your database (free tier available)
4. **Payment Method** - Required for Railway web service deployment

---

## Step 1: Prepare Your Repository

Your project already has a `railway.json` configuration file, so Railway will automatically detect the build and start commands.

**Current Configuration:**
- Build Command: `npm run build`
- Start Command: `npm start`
- Port: Railway will automatically assign (use `PORT` env variable)

---

## Step 2: Create Railway Account & Project

1. **Sign Up**
   - Go to https://railway.app
   - Click "Start a New Project"
   - Sign up with GitHub (recommended)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Authorize Railway to access your GitHub repositories
   - Select your repository: `sarf14/onboarding_tool` (or your repo name)

3. **Configure Service**
   - Railway will detect your project
   - **Important**: Set the **Root Directory** to `backend`
     - Go to Settings → Root Directory
     - Set it to: `backend`
   - Railway will automatically detect Node.js and use your `railway.json` config

---

## Step 3: Set Environment Variables

Go to your service → **Variables** tab and add these environment variables:

### Required Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Authentication (Generate a secure secret)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Frontend URL (Update after deploying frontend)
FRONTEND_URL=https://your-frontend.vercel.app

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here

# LLM API Configuration (DeepSeek)
LLM_API_KEY=your-deepseek-api-key-here
LLM_API_URL=https://api.deepseek.com/chat/completions
LLM_MODEL=deepseek-chat
```

### How to Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Click **Settings** → **API**
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

### How to Generate JWT_SECRET

Run this command locally:
```bash
openssl rand -base64 32
```

Or use an online generator. Copy the output and paste it as `JWT_SECRET`.

---

## Step 4: Deploy

1. **Railway will automatically deploy** when you:
   - Push code to your GitHub repository
   - Add environment variables
   - Make changes to the service

2. **Monitor the Deployment**
   - Go to the **Deployments** tab
   - Watch the build logs
   - Wait for "Build successful" message

3. **Get Your Backend URL**
   - Once deployed, Railway will generate a URL like:
     `https://your-project-name.up.railway.app`
   - Copy this URL - you'll need it for your frontend

---

## Step 5: Configure Custom Domain (Optional)

1. Go to **Settings** → **Networking**
2. Click "Generate Domain" or "Add Custom Domain"
3. Railway will provide a domain like: `your-project.up.railway.app`

---

## Step 6: Update Frontend Configuration

After your backend is deployed:

1. **Get your Railway backend URL**
   - Example: `https://onboarding-backend.up.railway.app`

2. **Update Frontend Environment Variable**
   - In Vercel (or your frontend hosting):
   - Set `NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api`
   - **Important**: Include `/api` at the end!

3. **Update Backend CORS**
   - Go back to Railway → Variables
   - Update `FRONTEND_URL` to your frontend URL
   - Railway will automatically redeploy

---

## Step 7: Verify Deployment

### Test Backend Health Endpoint

Open in browser or use curl:
```bash
curl https://your-backend.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test Login Endpoint

```bash
curl -X POST https://your-backend.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

---

## Railway Configuration Files

Your project already includes `railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

This tells Railway:
- Use Nixpacks builder (auto-detects Node.js)
- Run `npm run build` to build TypeScript
- Run `npm start` to start the server
- Auto-restart on failure (up to 10 times)

---

## Environment Variables Reference

### Complete List for Railway

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | ✅ | Server port (Railway sets this automatically) | `5000` |
| `NODE_ENV` | ✅ | Environment mode | `production` |
| `JWT_SECRET` | ✅ | Secret for JWT tokens | `your-secret-key` |
| `JWT_EXPIRES_IN` | ❌ | Token expiration | `7d` |
| `FRONTEND_URL` | ✅ | Frontend URL for CORS | `https://app.vercel.app` |
| `SUPABASE_URL` | ✅ | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key | `eyJ...` |
| `SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key | `eyJ...` |
| `LLM_API_KEY` | ✅ | DeepSeek API key | `sk-...` |
| `LLM_API_URL` | ❌ | LLM API endpoint | `https://api.deepseek.com/chat/completions` |
| `LLM_MODEL` | ❌ | LLM model name | `deepseek-chat` |

---

## Troubleshooting

### Build Fails

**Error: "Cannot find module"**
- Check that all dependencies are in `package.json`
- Railway runs `npm install` automatically
- Check build logs for missing dependencies

**Error: "TypeScript compilation failed"**
- Check `tsconfig.json` is correct
- Verify all TypeScript files compile locally first
- Check build logs for specific errors

### Deployment Fails

**Error: "Port already in use"**
- Railway sets `PORT` automatically - don't hardcode it
- Your code should use `process.env.PORT || 5000`

**Error: "Cannot connect to database"**
- Verify `SUPABASE_URL` is correct
- Check `SUPABASE_SERVICE_ROLE_KEY` is set
- Ensure Supabase project is active

### Runtime Errors

**Error: "JWT_SECRET must be set"**
- Add `JWT_SECRET` environment variable
- Generate a secure random string

**Error: "CORS error"**
- Update `FRONTEND_URL` in Railway variables
- Ensure frontend URL matches exactly (including `https://`)

**Error: "404 Not Found"**
- Check that your frontend uses `/api` prefix
- Example: `https://backend.up.railway.app/api/auth/login`
- Not: `https://backend.up.railway.app/auth/login`

---

## Monitoring & Logs

### View Logs

1. Go to your Railway service
2. Click **Deployments** tab
3. Click on a deployment
4. View **Build Logs** and **Deploy Logs**

### Real-time Logs

1. Go to your Railway service
2. Click **Logs** tab
3. See real-time application logs

### Metrics

Railway provides:
- CPU usage
- Memory usage
- Network traffic
- Request count

View in **Metrics** tab.

---

## Cost & Limits

### Railway Free Tier

- **$5/month free credit**
- Usually enough for small-medium apps
- Pay-as-you-go after free credit

### Estimated Costs

- **Small app**: ~$0-5/month (within free tier)
- **Medium app**: ~$5-20/month
- **Large app**: ~$20-50/month

### Tips to Reduce Costs

1. Use Railway's free tier efficiently
2. Optimize your app (reduce memory usage)
3. Use Supabase free tier for database
4. Monitor usage in Railway dashboard

---

## Quick Checklist

- [ ] Railway account created
- [ ] GitHub repository connected
- [ ] Root directory set to `backend`
- [ ] All environment variables added
- [ ] Supabase credentials configured
- [ ] JWT_SECRET generated and added
- [ ] Deployment successful
- [ ] Backend URL copied
- [ ] Health endpoint tested
- [ ] Frontend `NEXT_PUBLIC_API_URL` updated
- [ ] CORS configured correctly
- [ ] Login tested

---

## Next Steps

After backend is deployed:

1. **Deploy Frontend** to Vercel
   - Set `NEXT_PUBLIC_API_URL` to your Railway backend URL + `/api`
   - Example: `https://your-backend.up.railway.app/api`

2. **Update Backend CORS**
   - Set `FRONTEND_URL` in Railway to your Vercel frontend URL

3. **Test Everything**
   - Login flow
   - API endpoints
   - Database connections
   - All features

---

## Need Help?

If you encounter issues:

1. Check Railway logs
2. Verify environment variables
3. Test endpoints with curl/Postman
4. Check Supabase dashboard
5. Review error messages carefully

Common issues are usually:
- Missing environment variables
- Incorrect URLs (missing `/api` prefix)
- CORS configuration
- Database connection issues

---

## Example Railway Setup

Here's what your Railway dashboard should look like:

```
Project: onboarding-tool
├── Service: backend
    ├── Root Directory: backend
    ├── Build Command: npm run build (auto-detected)
    ├── Start Command: npm start (auto-detected)
    ├── Port: 5000 (auto-assigned)
    ├── Domain: onboarding-backend.up.railway.app
    └── Variables:
        ├── PORT=5000
        ├── NODE_ENV=production
        ├── JWT_SECRET=***
        ├── FRONTEND_URL=https://app.vercel.app
        ├── SUPABASE_URL=https://xxx.supabase.co
        ├── SUPABASE_SERVICE_ROLE_KEY=***
        ├── SUPABASE_ANON_KEY=***
        └── LLM_API_KEY=***
```

---

## Summary

1. **Sign up** at railway.app
2. **Connect** GitHub repository
3. **Set** root directory to `backend`
4. **Add** all environment variables
5. **Deploy** (automatic)
6. **Copy** backend URL
7. **Update** frontend with backend URL
8. **Test** everything

That's it! Your backend should be live on Railway. 🚀
