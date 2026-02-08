# SMTP Configuration Guide

This guide will help you configure SMTP (Simple Mail Transfer Protocol) to enable email notifications when mentors are assigned to mentees.

## Quick Setup Steps

1. **Choose an SMTP provider** (Gmail, Resend, SendGrid, etc.)
2. **Get your SMTP credentials** from the provider
3. **Add credentials to `backend/.env` file**
4. **Restart your backend server**

---

## Option 1: Gmail (Free, Easy Setup)

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification" if not already enabled

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select "Other (Custom name)" as the device
4. Enter "Autonex Backend" as the name
5. Click "Generate"
6. **Copy the 16-character password** (you'll use this as SMTP_PASSWORD)

### Step 3: Add to backend/.env
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
SMTP_FROM=noreply@autonex.com
```

**Important:** Use the app password (16 characters), NOT your regular Gmail password.

### Step 4: Restart Backend
```bash
cd backend
npm run dev
```

---

## Option 2: Resend (Recommended for Production)

Resend is a modern email API service with a generous free tier (3,000 emails/month).

### Step 1: Sign Up
1. Go to https://resend.com
2. Sign up for a free account
3. Verify your email

### Step 2: Get SMTP Credentials
1. Go to https://resend.com/emails
2. Click on "SMTP" in the sidebar
3. Copy your SMTP credentials:
   - **Host:** `smtp.resend.com`
   - **Port:** `587`
   - **Username:** `resend`
   - **Password:** Your API key (starts with `re_`)

### Step 3: Add to backend/.env
```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=re_your_api_key_here
SMTP_FROM=onboarding@yourdomain.com
```

**Note:** You need to verify your domain in Resend to use custom "from" addresses. For testing, you can use `onboarding@resend.dev` (provided by Resend).

### Step 4: Restart Backend
```bash
cd backend
npm run dev
```

---

## Option 3: SendGrid (Free Tier Available)

### Step 1: Sign Up
1. Go to https://sendgrid.com
2. Sign up for a free account (100 emails/day free)

### Step 2: Create API Key
1. Go to Settings > API Keys
2. Click "Create API Key"
3. Name it "Autonex Backend"
4. Select "Full Access" or "Mail Send" permissions
5. Copy the API key

### Step 3: Add to backend/.env
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key_here
SMTP_FROM=noreply@yourdomain.com
```

**Note:** The username is always `apikey`, and the password is your SendGrid API key.

### Step 4: Restart Backend
```bash
cd backend
npm run dev
```

---

## Option 4: Mailgun (Free Tier Available)

### Step 1: Sign Up
1. Go to https://www.mailgun.com
2. Sign up for a free account (5,000 emails/month free)

### Step 2: Get SMTP Credentials
1. Go to Sending > Domain Settings
2. Click on your domain
3. Go to "SMTP credentials" section
4. Copy your SMTP username and password

### Step 3: Add to backend/.env
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@yourdomain.mailgun.org
SMTP_PASSWORD=your_mailgun_password
SMTP_FROM=noreply@yourdomain.com
```

### Step 4: Restart Backend
```bash
cd backend
npm run dev
```

---

## Option 5: AWS SES (Amazon Simple Email Service)

### Step 1: Set Up AWS SES
1. Go to AWS Console > SES
2. Verify your email address or domain
3. Request production access (if needed)
4. Create SMTP credentials

### Step 2: Get SMTP Credentials
1. In SES, go to "SMTP Settings"
2. Click "Create SMTP Credentials"
3. Copy the username and password

### Step 3: Add to backend/.env
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_ses_smtp_username
SMTP_PASSWORD=your_ses_smtp_password
SMTP_FROM=noreply@yourdomain.com
```

**Note:** Replace `us-east-1` with your AWS region.

---

## Testing Your Configuration

After configuring SMTP, test it by assigning a mentor to a mentee:

1. **Go to Admin Panel**
2. **Assign a mentor** to a mentee (both should have email addresses)
3. **Check backend console logs** - you should see:
   ```
   📧 Sending mentor assignment emails...
   ✅ Email sent successfully to mentor: mentor@example.com
   ✅ Email sent successfully to mentee: mentee@example.com
   ```

4. **Check email inboxes** (and spam folder) for the emails

---

## Troubleshooting

### Emails Not Sending?

1. **Check Backend Logs**
   - Look for error messages in the console
   - Check if SMTP is properly configured

2. **Verify Credentials**
   - Double-check SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD
   - Make sure there are no extra spaces or quotes

3. **Check Firewall/Network**
   - Ensure port 587 (or 465) is not blocked
   - Some networks block SMTP ports

4. **Verify Email Addresses**
   - Make sure mentor and mentee have valid email addresses in the database
   - Check for typos in email addresses

5. **Check Provider Limits**
   - Gmail: 500 emails/day limit
   - Free tiers have sending limits
   - Check your provider's dashboard for quota

### Common Errors

**Error: "Invalid login"**
- Wrong username or password
- For Gmail: Make sure you're using App Password, not regular password
- For SendGrid: Username should be `apikey`

**Error: "Connection timeout"**
- Check SMTP_HOST and SMTP_PORT
- Verify firewall isn't blocking the port
- Try port 465 with `secure: true` (SSL)

**Error: "Authentication failed"**
- Verify credentials are correct
- Check if 2FA is enabled (for Gmail)
- Regenerate API keys if needed

**Emails Going to Spam**
- Verify your domain (SPF, DKIM records)
- Use a verified "from" address
- Avoid spam trigger words in subject/content

---

## Environment Variables Summary

Add these to your `backend/.env` file:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com              # Your SMTP server hostname
SMTP_PORT=587                         # Port (587 for TLS, 465 for SSL)
SMTP_USER=your-email@gmail.com        # SMTP username/email
SMTP_PASSWORD=your-app-password       # SMTP password/API key
SMTP_FROM=noreply@autonex.com         # From email address (optional)
```

---

## Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use App Passwords** - Don't use your main account password
3. **Rotate Credentials** - Change passwords/API keys periodically
4. **Use Environment Variables** - In production, use your hosting platform's env vars (Vercel, Railway, etc.)
5. **Limit Permissions** - Use least-privilege API keys when possible

---

## Production Deployment

When deploying to production (Railway, Render, Vercel, etc.):

1. **Add environment variables** in your hosting platform's dashboard
2. **Don't commit `.env`** - Use platform's environment variable settings
3. **Use verified domains** - Set up SPF/DKIM records for better deliverability
4. **Monitor email logs** - Check your SMTP provider's dashboard for delivery status

---

## Quick Reference: Provider Settings

| Provider | Host | Port | Username | Password |
|----------|------|------|----------|----------|
| Gmail | smtp.gmail.com | 587 | your-email@gmail.com | App Password |
| Resend | smtp.resend.com | 587 | resend | API Key (re_...) |
| SendGrid | smtp.sendgrid.net | 587 | apikey | API Key |
| Mailgun | smtp.mailgun.org | 587 | postmaster@domain | SMTP Password |
| AWS SES | email-smtp.region.amazonaws.com | 587 | SMTP Username | SMTP Password |

---

## Need Help?

If you're still having issues:

1. Check backend console logs for detailed error messages
2. Verify your SMTP provider's documentation
3. Test SMTP connection using a tool like `telnet` or `openssl`
4. Check your provider's status page for outages

Example test command:
```bash
openssl s_client -connect smtp.gmail.com:587 -starttls smtp
```
