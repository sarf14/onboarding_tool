# Brevo SMTP Password Generation - Step by Step

## ⚠️ IMPORTANT: SMTP Password vs Account Password

**NO, they are NOT the same!**

- **Account Password:** Your login password for Brevo website (DO NOT use this for SMTP)
- **SMTP Password:** A separate, generated password specifically for SMTP authentication (this is what you need)

You **MUST generate** a separate SMTP password. You cannot use your account login password for SMTP.

---

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

### Step 4: Get SMTP Password/API Key

**Option A: If you see "SMTP Password" section:**
1. Look for the **"SMTP Password"** section
2. You might see:
   - A **"Generate"** button
   - Or **"Reset"** / **"Regenerate"** button
   - Or **"Show"** / **"Reveal"** button (if password already exists)
3. Click the button to generate or reveal the password
4. **⚠️ IMPORTANT:** Copy the password immediately - Brevo will show it only once!
5. The password will be a random string like: `aBc123XyZ456DeF789`

**Option B: If you see "API Key" instead (NEW METHOD):**
Brevo might use API keys for SMTP authentication. In this case:
1. Go to **"SMTP & API"** → **"API Keys"** tab (not SMTP tab)
2. Click **"Generate a new API key"**
3. Give it a name like "SMTP Authentication"
4. Copy the API key (starts with `xkeysib-...`)
5. **Use this API key as your SMTP_PASSWORD**

**Option C: If you see "Master Password" or "SMTP Key":**
1. Look for any password/key field in the SMTP section
2. If it's hidden, click **"Show"** or **"Reveal"**
3. If it says "Not set" or empty, look for **"Create"** or **"Set"** button
4. Copy whatever password/key is shown

**Option D: Check if SMTP is enabled:**
- Some Brevo accounts need SMTP to be enabled first
- Look for an **"Enable SMTP"** toggle or button
- Enable it, then try again

### Step 5: Save Your Credentials

**If using SMTP Password:**
- **SMTP_HOST:** `smtp-relay.brevo.com`
- **SMTP_PORT:** `587`
- **SMTP_USER:** Your Brevo account email (shown on the page)
- **SMTP_PASSWORD:** The SMTP password you generated
- **SMTP_FROM:** `noreply@sendinblue.com` (for free tier)

**If using API Key (Alternative Method):**
- **SMTP_HOST:** `smtp-relay.brevo.com`
- **SMTP_PORT:** `587`
- **SMTP_USER:** Your Brevo account email
- **SMTP_PASSWORD:** Your API key (from API Keys tab, starts with `xkeysib-...`)
- **SMTP_FROM:** `noreply@sendinblue.com` (for free tier)

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

**Try these solutions:**

1. **Check API Keys Tab Instead:**
   - Go to **"SMTP & API"** → **"API Keys"** tab
   - Generate an API key there
   - Use the API key as `SMTP_PASSWORD`
   - Use your Brevo account email as `SMTP_USER`

2. **Enable SMTP First:**
   - Look for an **"Enable SMTP"** toggle or button
   - Enable SMTP functionality first
   - Then try to generate password

3. **Check Account Type:**
   - Free tier accounts might have different UI
   - Try upgrading to a paid plan (then downgrade) to unlock features
   - Or contact Brevo support

4. **Use API Key Method:**
   - If you can't find SMTP password, use API key instead:
   - Generate API key from **"API Keys"** tab
   - Use API key as `SMTP_PASSWORD`
   - Use your email as `SMTP_USER`

5. **Contact Brevo Support:**
   - If nothing works, contact Brevo support
   - They can help you get SMTP credentials

### Password Not Working?
- **Did you use your account password?** → NO! You must generate a separate SMTP password
- Make sure you copied the SMTP password correctly (no extra spaces)
- Regenerate a new SMTP password if needed
- Check that `SMTP_USER` matches your Brevo account email exactly
- Make sure you're using the **generated SMTP password**, not your login password

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
