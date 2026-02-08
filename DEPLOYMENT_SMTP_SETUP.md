# Setting Up SMTP in Deployed Environment

Your SMTP credentials are configured locally in `backend/.env`, but they need to be added to your **deployed backend** environment variables.

## Quick Fix: Add SMTP Variables to Your Deployment Platform

Based on your portal URL (`https://onboarding-tool-psi.vercel.app`), you're likely using **Vercel** or **Railway** for backend deployment.

---

## Option 1: If Backend is on Railway

### Steps:
1. Go to https://railway.app
2. Open your backend project
3. Click on **"Variables"** tab
4. Add these environment variables:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=autonexai101@gmail.com
SMTP_PASSWORD=rrkg rjko bdup tmjn
SMTP_FROM=noreply@autonex.com
```

5. **Redeploy** your backend (Railway will auto-redeploy when you add variables)

### How to Redeploy:
- Railway auto-redeploys when you add variables
- Or click "Redeploy" button in the dashboard

---

## Option 2: If Backend is on Render

### Steps:
1. Go to https://render.com
2. Open your backend service
3. Go to **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Add each variable:

```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = autonexai101@gmail.com
SMTP_PASSWORD = rrkg rjko bdup tmjn
SMTP_FROM = noreply@autonex.com
```

6. **Redeploy** your service

---

## Option 3: If Backend is on Vercel

### Steps:
1. Go to https://vercel.com
2. Open your backend project
3. Go to **"Settings"** → **"Environment Variables"**
4. Add each variable:

```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = autonexai101@gmail.com
SMTP_PASSWORD = rrkg rjko bdup tmjn
SMTP_FROM = noreply@autonex.com
```

5. **Redeploy** your backend

---

## Option 4: If Backend is on Other Platform

### General Steps:
1. Find **"Environment Variables"** or **"Config Vars"** section
2. Add all 5 SMTP variables:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASSWORD`
   - `SMTP_FROM`
3. **Redeploy** your backend service

---

## Verify SMTP is Working

After adding variables and redeploying:

1. **Assign a mentor to a mentee** in the admin panel
2. **Check backend logs** in your deployment platform:
   - Railway: Go to "Deployments" → Click latest deployment → View logs
   - Render: Go to "Logs" tab
   - Vercel: Go to "Deployments" → Click latest → View logs

3. **Look for these log messages:**
   ```
   📧 Sending mentor assignment emails...
   ✅ Email sent successfully to mentor: mentor@example.com
   ✅ Email sent successfully to mentee: mentee@example.com
   ```

4. **If you see errors**, check:
   - Gmail App Password is correct (no spaces: `rrkgrjko bduptmjn` → should be `rrkg rjko bdup tmjn` with spaces)
   - 2FA is enabled on Gmail account
   - App Password was generated correctly

---

## Troubleshooting

### Emails Still Not Sending?

1. **Check Backend Logs**
   - Look for error messages
   - Common errors:
     - "Invalid login" → Wrong password or need App Password
     - "Connection timeout" → Firewall blocking port 587
     - "Authentication failed" → Wrong credentials

2. **Verify Gmail App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Make sure the password matches exactly (with spaces)
   - Regenerate if needed

3. **Check Email Addresses**
   - Make sure mentor and mentee have valid email addresses in database
   - Check for typos in email addresses

4. **Test SMTP Connection**
   - Try sending a test email from your backend logs
   - Check if Gmail account has any restrictions

---

## Important Notes

- **Never commit `.env` file** - Environment variables should be set in your deployment platform
- **Gmail Limits**: 500 emails/day on free Gmail accounts
- **App Password**: Must use App Password, not regular Gmail password
- **Spaces in Password**: Gmail App Passwords have spaces (e.g., `rrkg rjko bdup tmjn`) - keep them!

---

## Quick Checklist

- [ ] Added `SMTP_HOST` to deployment platform
- [ ] Added `SMTP_PORT` to deployment platform
- [ ] Added `SMTP_USER` to deployment platform
- [ ] Added `SMTP_PASSWORD` to deployment platform (with spaces!)
- [ ] Added `SMTP_FROM` to deployment platform
- [ ] Redeployed backend
- [ ] Checked backend logs for email sending
- [ ] Verified mentor and mentee have email addresses

---

## Need Help?

If emails still aren't sending after adding variables:
1. Check backend logs for specific error messages
2. Verify Gmail App Password is correct
3. Try regenerating Gmail App Password
4. Check if Gmail account has any security restrictions
