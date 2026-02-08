# Resend API Setup (Alternative to SMTP)

If SMTP connection is timing out or blocked by your deployment platform's firewall, use Resend's API directly instead of SMTP. This is more reliable and doesn't require SMTP port access.

## Why Use Resend API?

- ✅ **No SMTP port needed** - Works through HTTPS (port 443)
- ✅ **No firewall issues** - Uses standard HTTP requests
- ✅ **More reliable** - Better error handling and retries
- ✅ **Faster** - Direct API calls are faster than SMTP

---

## Step 1: Install Resend SDK

```bash
cd backend
npm install resend
```

---

## Step 2: Update Email Service

The email service needs to be updated to use Resend API. This requires code changes.

**Option A: Quick Fix (Recommended)**
- Use Resend's web dashboard to send emails manually for now
- Or wait for code update to use Resend API

**Option B: Code Update**
- Update `backend/src/services/emailService.ts` to use Resend SDK
- Requires modifying the email sending logic

---

## Step 3: Get Resend API Key

1. Go to https://resend.com
2. Go to **API Keys** section
3. Copy your API key (starts with `re_...`)

---

## Step 4: Set Environment Variable

In your deployment platform, add:

```
RESEND_API_KEY=re_YOUR_API_KEY_HERE
```

Remove or keep the SMTP variables (they won't be used if API is configured).

---

## Temporary Workaround

If emails are urgent and SMTP is blocked:

1. **Use Resend Dashboard:**
   - Go to https://resend.com/emails
   - Click "Send Email"
   - Manually send mentor assignment emails

2. **Use Resend API via cURL:**
   ```bash
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer re_YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "from": "onboarding@resend.dev",
       "to": "mentor@example.com",
       "subject": "New Mentee Assigned",
       "html": "<p>Email content here</p>"
     }'
   ```

---

## Next Steps

I can update the email service code to use Resend API instead of SMTP. This will solve the connection timeout issue. Should I proceed with that?
