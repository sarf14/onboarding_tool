# Resend SMTP Setup Guide

Resend is a modern email API service that's perfect for production deployments. It's more reliable than Gmail SMTP and works seamlessly with deployment platforms like Railway, Render, and Vercel.

## Why Resend?

- ✅ **No IPv6 issues** - Works perfectly with all deployment platforms
- ✅ **Free tier** - 3,000 emails/month free
- ✅ **Easy setup** - Simple API key authentication
- ✅ **Better deliverability** - Professional email infrastructure
- ✅ **No App Password needed** - Just an API key

---

## Step-by-Step Setup

### Step 1: Create Resend Account

1. Go to https://resend.com
2. Click **"Sign Up"** (top right)
3. Sign up with your email or GitHub account
4. Verify your email address

### Step 2: Get Your API Key

1. After logging in, you'll see the Resend dashboard
2. Click on **"API Keys"** in the left sidebar
3. Click **"Create API Key"**
4. Give it a name (e.g., "Autonex Backend")
5. Select permissions: **"Sending access"** (or "Full access" if you need more)
6. Click **"Add API Key"**
7. **IMPORTANT:** Copy the API key immediately - you won't be able to see it again!
   - It will look like: `re_123456789abcdefghijklmnopqrstuvwxyz`

### Step 3: Verify Your Domain (Optional but Recommended)

For production use, you should verify your domain:

1. Go to **"Domains"** in the left sidebar
2. Click **"Add Domain"**
3. Enter your domain (e.g., `autonex.com`)
4. Add the DNS records Resend provides to your domain's DNS settings
5. Wait for verification (usually a few minutes)

**Note:** For testing, you can use `onboarding@resend.dev` (provided by Resend) without domain verification.

### Step 4: Configure Backend Environment Variables

#### For Local Development (`backend/.env`):

```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=re_YOUR_API_KEY_HERE
SMTP_FROM=onboarding@resend.dev
```

**Important:**
- `SMTP_USER` is always `resend` (not your email)
- `SMTP_PASSWORD` is your Resend API key (starts with `re_`)
- `SMTP_FROM` can be `onboarding@resend.dev` for testing, or your verified domain email for production

#### For Deployed Environment (Railway/Render/Vercel):

1. **Railway:**
   - Go to your project → Click on your backend service
   - Go to **"Variables"** tab
   - Add these environment variables:
     ```
     SMTP_HOST=smtp.resend.com
     SMTP_PORT=587
     SMTP_USER=resend
     SMTP_PASSWORD=re_YOUR_API_KEY_HERE
     SMTP_FROM=onboarding@resend.dev
     ```

2. **Render:**
   - Go to your service dashboard
   - Go to **"Environment"** tab
   - Add each variable:
     ```
     SMTP_HOST = smtp.resend.com
     SMTP_PORT = 587
     SMTP_USER = resend
     SMTP_PASSWORD = re_YOUR_API_KEY_HERE
     SMTP_FROM = onboarding@resend.dev
     ```

3. **Vercel:**
   - Go to your project → **Settings** → **Environment Variables**
   - Add each variable for **Production**, **Preview**, and **Development**:
     ```
     SMTP_HOST = smtp.resend.com
     SMTP_PORT = 587
     SMTP_USER = resend
     SMTP_PASSWORD = re_YOUR_API_KEY_HERE
     SMTP_FROM = onboarding@resend.dev
     ```

### Step 5: Restart/Redeploy Backend

- **Local:** Restart your backend server
- **Deployed:** Your platform will auto-redeploy when you add environment variables

### Step 6: Test Email Sending

1. Assign a mentor to a mentee in the admin panel
2. Check backend logs - you should see:
   ```
   [SMTP] ✅ SMTP connection verified successfully
   [SMTP] ✅ Email sent successfully to mentor: ...
   [SMTP] ✅ Email sent successfully to mentee: ...
   ```
3. Check email inboxes (including spam folder)

---

## Resend Dashboard

After setup, you can:
- View email logs in Resend dashboard
- See delivery status (sent, delivered, bounced, etc.)
- Monitor email usage
- View email analytics

---

## Troubleshooting

### Issue: "Authentication failed"
- **Solution:** Make sure `SMTP_USER` is exactly `resend` (lowercase)
- **Solution:** Verify your API key is correct (starts with `re_`)

### Issue: "Email not received"
- **Solution:** Check spam folder
- **Solution:** If using `onboarding@resend.dev`, make sure it's not blocked
- **Solution:** For production, verify your domain in Resend

### Issue: "Connection timeout"
- **Solution:** Check that `SMTP_HOST` is `smtp.resend.com`
- **Solution:** Verify `SMTP_PORT` is `587`
- **Solution:** Check your deployment platform's network settings

---

## Production Setup (Using Your Domain)

Once you verify your domain in Resend:

1. Update `SMTP_FROM` to use your domain:
   ```env
   SMTP_FROM=noreply@yourdomain.com
   ```

2. Or use a specific email:
   ```env
   SMTP_FROM=onboarding@yourdomain.com
   ```

---

## Quick Reference

| Setting | Value |
|---------|-------|
| SMTP Host | `smtp.resend.com` |
| SMTP Port | `587` |
| SMTP User | `resend` |
| SMTP Password | Your Resend API key (`re_...`) |
| SMTP From | `onboarding@resend.dev` (testing) or `noreply@yourdomain.com` (production) |

---

## Cost

- **Free Tier:** 3,000 emails/month
- **Paid Plans:** Start at $20/month for 50,000 emails

For most use cases, the free tier is sufficient!

---

## Need Help?

- Resend Documentation: https://resend.com/docs
- Resend Support: support@resend.com
- Check backend logs for detailed SMTP debugging information
