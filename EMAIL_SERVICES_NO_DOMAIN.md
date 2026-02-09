# Email Services That Don't Require Domain Verification

Here are email services you can use **without verifying a domain** (or with minimal setup):

---

## Option 1: Brevo (formerly Sendinblue) - RECOMMENDED ⭐

**Free Tier:** 300 emails/day (9,000/month)

### Why Brevo?
- ✅ **No domain verification needed** for free tier
- ✅ **Easy SMTP setup**
- ✅ **Generous free tier** (300 emails/day)
- ✅ **Works with all deployment platforms**

### Setup Steps:

1. **Sign Up**
   - Go to https://www.brevo.com
   - Sign up for a free account
   - Verify your email

2. **Get SMTP Credentials**
   - Log in to your Brevo account
   - Click on your **profile icon** (top right) → **Settings**
   - In the left sidebar, click **"SMTP & API"**
   - You'll see two tabs: **"SMTP"** and **"API Keys"** - click on **"SMTP"** tab
   - You'll see your SMTP server details:
     - **Server:** `smtp-relay.brevo.com`
     - **Port:** `587`
     - **Login:** Your Brevo account email (shown on the page)
   
3. **Generate SMTP Password**
   - On the SMTP page, look for **"SMTP Password"** section
   - Click the **"Generate"** button (or "Create Password" button)
   - **IMPORTANT:** Copy the password immediately - you won't be able to see it again!
   - The password will look something like: `aBc123XyZ456DeF789` (random characters)
   - **Save this password** - this is your `SMTP_PASSWORD`

3. **Update Environment Variables** (in your deployment platform):
   ```
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_USER=a1ebde001@smtp-brevo.com
   SMTP_PASSWORD=your-brevo-smtp-password
   SMTP_FROM=noreply@sendinblue.com
   ```
   **Note:** For free tier, you can use `noreply@sendinblue.com` as the "from" address.

4. **Remove Resend API Key** (optional):
   - Remove `RESEND_API_KEY` from environment variables
   - The code will automatically use SMTP instead

5. **Redeploy** your backend

---

## Option 2: Mailjet - Free Tier

**Free Tier:** 6,000 emails/month

### Setup:

1. Sign up at https://www.mailjet.com
2. Go to **Account Settings** → **SMTP**
3. Get your SMTP credentials:
   ```
   SMTP_HOST=smtp.mailjet.com
   SMTP_PORT=587
   SMTP_USER=your-api-key
   SMTP_PASSWORD=your-secret-key
   SMTP_FROM=noreply@mailjet.com
   ```

---

## Option 3: Elastic Email - Free Tier

**Free Tier:** 1,000 emails/month

### Setup:

1. Sign up at https://elasticemail.com
2. Go to **Settings** → **SMTP**
3. Get your SMTP credentials:
   ```
   SMTP_HOST=smtp.elasticemail.com
   SMTP_PORT=587
   SMTP_USER=your-email@example.com
   SMTP_PASSWORD=your-smtp-password
   SMTP_FROM=your-email@example.com
   ```

---

## Option 4: Use Gmail SMTP (If IPv6 Issue is Fixed)

If your deployment platform supports IPv6 or you can fix the IPv6 issue:

1. Use Gmail App Password (as before)
2. The code already has IPv4 forcing for Gmail
3. Update environment variables:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_FROM=your-email@gmail.com
   ```

---

## Recommended: Brevo (Sendinblue)

**I recommend Brevo** because:
- ✅ No domain verification needed
- ✅ 300 emails/day is plenty for most use cases
- ✅ Easy setup
- ✅ Reliable delivery
- ✅ Works with all platforms (Railway, Render, Vercel)

### Quick Setup for Brevo:

1. Sign up: https://www.brevo.com
2. Get SMTP password from Settings → SMTP & API
3. Update environment variables:
   ```
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_USER=your-brevo-email@example.com
   SMTP_PASSWORD=your-brevo-smtp-password
   SMTP_FROM=noreply@sendinblue.com
   ```
4. Remove `RESEND_API_KEY` (so it uses SMTP)
5. Redeploy

---

## After Setup

Once you've configured any of these services:
1. Test by assigning a mentor to a mentee
2. Check backend logs for email sending status
3. Check email inboxes (including spam folder)

All of these services work with the existing SMTP code - no code changes needed!
