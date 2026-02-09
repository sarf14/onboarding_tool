# Brevo SMTP Password Generation - Step by Step

## How to Generate SMTP Password in Brevo

### Step 1: Log In to Brevo
1. Go to https://www.brevo.com
2. Log in with your account credentials

### Step 2: Navigate to SMTP Settings
1. Click on your **profile icon** in the top right corner
2. Click **"Settings"** from the dropdown menu
3. In the left sidebar, click **"SMTP & API"**
4. Click on the **"SMTP"** tab (not "API Keys")

### Step 3: Find SMTP Password Section
On the SMTP page, you'll see:
- **SMTP Server:** `smtp-relay.brevo.com`
- **Port:** `587`
- **Login:** Your email address (e.g., `your-email@example.com`)
- **SMTP Password:** (This is what you need to generate)

### Step 4: Generate Password
1. Look for the **"SMTP Password"** section
2. Click the **"Generate"** button (or "Create Password" / "Generate Password")
3. **⚠️ IMPORTANT:** Copy the password immediately - Brevo will show it only once!
4. The password will be a random string like: `aBc123XyZ456DeF789`

### Step 5: Save Your Credentials
Copy these values:
- **SMTP_HOST:** `smtp-relay.brevo.com`
- **SMTP_PORT:** `587`
- **SMTP_USER:** Your Brevo account email (shown on the page)
- **SMTP_PASSWORD:** The password you just generated
- **SMTP_FROM:** `noreply@sendinblue.com` (for free tier, no domain verification needed)

### Step 6: Add to Environment Variables
In your deployment platform (Render/Railway/Vercel), add:
```
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=the-generated-password-here
SMTP_FROM=noreply@sendinblue.com
```

### Step 7: Remove Resend API Key (Optional)
If you have `RESEND_API_KEY` set, remove it so the system uses SMTP instead of Resend API.

### Step 8: Redeploy
After adding the environment variables, redeploy your backend.

---

## Troubleshooting

### Can't Find "Generate" Button?
- Make sure you're on the **"SMTP"** tab, not "API Keys"
- Try refreshing the page
- Check if you're on the free tier (some features may vary)

### Password Not Working?
- Make sure you copied the password correctly (no extra spaces)
- Regenerate a new password if needed
- Check that `SMTP_USER` matches your Brevo account email exactly

### Still Having Issues?
- Check Brevo documentation: https://help.brevo.com/hc/en-us/articles/209467485
- Make sure your Brevo account is verified
- Try regenerating the SMTP password

---

## Visual Guide

1. **Login** → Click profile icon (top right)
2. **Settings** → Click "Settings"
3. **SMTP & API** → Click in left sidebar
4. **SMTP Tab** → Click "SMTP" tab
5. **Generate** → Click "Generate" button next to SMTP Password
6. **Copy** → Copy the password immediately!

---

## Quick Reference

| Setting | Value |
|---------|-------|
| SMTP Host | `smtp-relay.brevo.com` |
| SMTP Port | `587` |
| SMTP User | Your Brevo account email |
| SMTP Password | Generated password (click Generate) |
| SMTP From | `noreply@sendinblue.com` (free tier) |
