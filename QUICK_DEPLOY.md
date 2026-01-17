# 🚀 Quick Free Deployment (10 Minutes)

## 100% FREE - No Credit Card Needed!

---

## Step-by-Step: Render + Vercel

### PART 1: Backend on Render (5 minutes)

1. **Go to Render**
   - Visit: https://render.com
   - Click "Get Started for Free"
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select your repository
   - Click "Connect"

3. **Configure**
   - **Name**: `onboarding-backend`
   - **Region**: Choose closest (e.g., `Oregon (US West)`)
   - **Branch**: `main` (or your main branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Select **FREE** (no credit card!)

4. **Environment Variables** (Click "Advanced")
   Add these one by one:
   ```
   NODE_ENV = production
   PORT = 10000
   JWT_SECRET = [generate below]
   FRONTEND_URL = https://your-app.vercel.app [update after frontend deploy]
   SUPABASE_URL = [your supabase url]
   SUPABASE_SERVICE_ROLE_KEY = [your key]
   SUPABASE_ANON_KEY = [your key]
   ```

   **Generate JWT_SECRET**:
   ```bash
   # Run this locally:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output and use it as JWT_SECRET

5. **Deploy**
   - Click "Create Web Service"
   - Wait ~5 minutes for first deployment
   - Copy your URL: `https://onboarding-backend.onrender.com`

6. **Test**
   ```bash
   curl https://onboarding-backend.onrender.com/api/health
   ```
   Should return: `{"status":"ok",...}`

---

### PART 2: Frontend on Vercel (5 minutes)

1. **Go to Vercel**
   - Visit: https://vercel.com
   - Click "Sign Up"
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend` (IMPORTANT!)
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `.next` (auto)

4. **Environment Variables**
   Click "Environment Variables" → Add:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://onboarding-backend.onrender.com/api
   ```
   (Use your actual Render backend URL)

5. **Deploy**
   - Click "Deploy"
   - Wait ~2-3 minutes
   - Get your URL: `https://your-app-name.vercel.app`

6. **Update Backend CORS**
   - Go back to Render dashboard
   - Click on your backend service
   - Go to "Environment" tab
   - Update `FRONTEND_URL` to your Vercel URL
   - Render will auto-redeploy

---

## ✅ Done! Your App is Live!

**Frontend**: `https://your-app.vercel.app`  
**Backend**: `https://onboarding-backend.onrender.com`

---

## 🎯 Test Your Deployment

1. Visit your Vercel URL
2. Try logging in with:
   - Email: `admin@test.com`
   - Password: `admin123`
3. Check if everything works!

---

## ⚠️ Important Notes

### Render Free Tier:
- ✅ **Free forever** - No credit card needed
- ✅ **750 hours/month** - Enough for 24/7
- ⚠️ **Cold starts**: First request after 15 min inactivity takes ~30 seconds
- ✅ **Auto-sleep**: After 15 min of no traffic

### Prevent Cold Starts (Optional):
Use a free ping service to keep it awake:
- https://cron-job.org (free)
- https://uptimerobot.com (free)
- Set to ping your backend every 10 minutes

---

## 🔧 Troubleshooting

### Backend not working?
- Check Render logs (click "Logs" in dashboard)
- Verify all environment variables are set
- Check if build succeeded

### Frontend can't reach backend?
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check browser console for errors
- Verify backend is running (check Render dashboard)

### Cold start too slow?
- First request after sleep takes ~30 seconds
- Subsequent requests are fast
- Use ping service to prevent sleep (optional)

---

## 💰 Cost Breakdown

| Service | Cost | Limits |
|---------|------|--------|
| **Vercel** | FREE | 100GB bandwidth/month |
| **Render** | FREE | 750 hours/month |
| **Supabase** | FREE | 500MB database, 2GB bandwidth |
| **Total** | **$0/month** | Perfect for your use case! |

---

## 🎉 You're All Set!

Your onboarding tool is now live and accessible to everyone!

**Share your Vercel URL with your users:**
- `https://your-app-name.vercel.app`

All 26 annotators can now log in and use the platform!

---

## Need Help?

If you get stuck:
1. Check the logs in Render/Vercel dashboards
2. Verify environment variables
3. Test backend health endpoint
4. Check browser console for frontend errors

I can help debug any issues!
