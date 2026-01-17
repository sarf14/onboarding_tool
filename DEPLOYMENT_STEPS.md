# Step-by-Step Deployment Instructions

## Quick Deploy: Vercel + Railway (15 minutes)

### Prerequisites
- GitHub account
- Supabase project (already have)
- Railway account (free)
- Vercel account (free)

---

## PART 1: Deploy Backend to Railway

### Step 1: Prepare Backend
1. Make sure your code is pushed to GitHub
2. Verify `backend/package.json` has build script: `"build": "tsc"`

### Step 2: Create Railway Project
1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub
5. Select your repository
6. Railway will detect it's a Node.js project

### Step 3: Configure Backend
1. In Railway dashboard, click on your service
2. Go to "Variables" tab
3. Add these environment variables:

```
PORT=5000
NODE_ENV=production
JWT_SECRET=your-very-secure-random-secret-key-min-32-chars
FRONTEND_URL=https://your-app-name.vercel.app
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

**To generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Set Build Settings
1. Go to "Settings" tab
2. Set Root Directory: `backend`
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`

### Step 5: Deploy
1. Railway will auto-deploy
2. Wait for deployment to complete
3. Click "Generate Domain" to get your backend URL
4. Copy the URL (e.g., `https://your-backend.up.railway.app`)

### Step 6: Test Backend
```bash
curl https://your-backend.up.railway.app/api/health
```
Should return: `{"status":"ok",...}`

---

## PART 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Project
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### Step 2: Configure Frontend
1. **Root Directory**: Set to `frontend`
2. **Framework Preset**: Next.js (auto-detected)
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)

### Step 3: Add Environment Variable
In "Environment Variables" section, add:
```
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
```
Replace `your-backend.up.railway.app` with your actual Railway URL.

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Vercel will give you a URL like `https://your-app.vercel.app`

### Step 5: Update Backend CORS
1. Go back to Railway
2. Update `FRONTEND_URL` variable to your Vercel URL
3. Railway will auto-redeploy

---

## PART 3: Final Configuration

### Update Frontend API URL
Your frontend should already be using `NEXT_PUBLIC_API_URL`, but verify:

1. Check `frontend/src/lib/api.ts` uses:
   ```typescript
   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
   ```

2. If not, update it (but it should already be correct)

### Test Everything
1. **Frontend**: Visit your Vercel URL
2. **Login**: Try logging in with admin credentials
3. **Backend**: Check Railway logs for any errors
4. **Database**: Verify Supabase connection works

---

## Troubleshooting

### Backend Issues

**Problem**: Backend won't start
- Check Railway logs
- Verify all environment variables are set
- Check `npm run build` works locally

**Problem**: Database connection fails
- Verify Supabase credentials
- Check Supabase project is active
- Verify network access

### Frontend Issues

**Problem**: Can't reach backend
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running (check Railway)
- Check browser console for CORS errors

**Problem**: Build fails
- Check Vercel build logs
- Verify all dependencies are in package.json
- Try building locally first: `cd frontend && npm run build`

---

## Custom Domain (Optional)

### Vercel Custom Domain
1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS setup instructions

### Railway Custom Domain
1. Go to Railway service settings
2. Click "Generate Domain" or "Custom Domain"
3. Add your domain
4. Update DNS records

---

## Monitoring & Logs

### Railway Logs
- View in Railway dashboard
- Real-time logs available
- Error tracking included

### Vercel Logs
- View in Vercel dashboard
- Function logs available
- Analytics included

---

## Cost Breakdown

### Free Tier (Recommended)
- **Vercel**: Free (hobby plan)
  - Unlimited deployments
  - 100GB bandwidth/month
  - Perfect for your use case

- **Railway**: $5/month credit
  - Usually enough for small-medium apps
  - Pay-as-you-go after credit

- **Supabase**: Free tier
  - 500MB database
  - 2GB bandwidth
  - 50,000 monthly active users

**Total**: ~$0-5/month

---

## Next Steps After Deployment

1. ✅ Test all features
2. ✅ Share URL with users
3. ✅ Set up monitoring
4. ✅ Configure backups (Supabase auto-backups)
5. ✅ Set up custom domain (optional)

---

## Need Help?

If you encounter issues:
1. Check logs in Railway/Vercel
2. Verify environment variables
3. Test locally first
4. Check Supabase dashboard

I can help debug any deployment issues!
