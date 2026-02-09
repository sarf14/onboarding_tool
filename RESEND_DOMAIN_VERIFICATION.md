# Resend Domain Verification Guide

## Problem

Resend's free/testing account only allows sending emails to your own email address. To send emails to other recipients (like mentors and mentees), you need to verify a domain.

## Solution: Verify Your Domain in Resend

### Step 1: Add Domain in Resend

1. Go to https://resend.com/domains
2. Click **"Add Domain"**
3. Enter your domain (e.g., `autonex.com` or `onboarding-tool.com`)
   - **Note:** You can use a subdomain like `mail.autonex.com` or `onboarding.autonex.com`
4. Click **"Add Domain"**

### Step 2: Add DNS Records

Resend will show you DNS records to add. You need to add these to your domain's DNS settings:

**Example DNS Records:**
```
Type: TXT
Name: @ (or your subdomain)
Value: [Resend will provide this]

Type: TXT
Name: _resend
Value: [Resend will provide this]

Type: CNAME
Name: [Resend will provide]
Value: [Resend will provide]
```

**How to Add DNS Records:**
- If using **GoDaddy**: Go to DNS Management → Add Record
- If using **Namecheap**: Go to Domain List → Manage → Advanced DNS
- If using **Cloudflare**: Go to DNS → Add Record
- If using **Google Domains**: Go to DNS → Custom Records

### Step 3: Wait for Verification

- DNS changes can take 5 minutes to 48 hours to propagate
- Resend will automatically verify your domain
- You'll see a green checkmark when verified

### Step 4: Update Environment Variables

Once your domain is verified, update your deployment environment variables:

**Change:**
```
SMTP_FROM=onboarding@resend.dev  ❌ (testing only)
```

**To:**
```
SMTP_FROM=noreply@yourdomain.com  ✅ (your verified domain)
```

Or:
```
SMTP_FROM=onboarding@yourdomain.com  ✅ (your verified domain)
```

### Step 5: Redeploy

After updating `SMTP_FROM`, redeploy your backend. Emails will now work for all recipients!

---

## Alternative: Use a Different Email Service

If you don't have a domain to verify, consider these alternatives:

### Option 1: SendGrid (Free Tier)
- 100 emails/day free
- No domain verification needed for testing
- Update environment variables:
  ```
  SMTP_HOST=smtp.sendgrid.net
  SMTP_PORT=587
  SMTP_USER=apikey
  SMTP_PASSWORD=your_sendgrid_api_key
  SMTP_FROM=noreply@yourdomain.com
  ```

### Option 2: Mailgun (Free Tier)
- 5,000 emails/month free
- Requires domain verification (but easier setup)
- Update environment variables:
  ```
  SMTP_HOST=smtp.mailgun.org
  SMTP_PORT=587
  SMTP_USER=postmaster@yourdomain.mailgun.org
  SMTP_PASSWORD=your_mailgun_password
  SMTP_FROM=noreply@yourdomain.com
  ```

### Option 3: AWS SES (Free Tier)
- 62,000 emails/month free (if on EC2)
- Requires domain verification
- More complex setup

---

## Quick Fix: Use Your Own Email for Testing

**Temporary workaround** (for testing only):
- Change `SMTP_FROM` to your verified email: `shaikhsarfaraz1426@gmail.com`
- But this will show your personal email as the sender (not ideal for production)

---

## Recommended: Verify Domain

**Best solution:** Verify your domain in Resend. It's free and takes about 10 minutes:
1. Add domain in Resend
2. Add DNS records
3. Wait for verification
4. Update `SMTP_FROM` to use your domain
5. Redeploy

This allows you to send professional emails from `noreply@yourdomain.com` or `onboarding@yourdomain.com`.
