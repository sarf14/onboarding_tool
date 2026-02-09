# Brevo API Setup Guide

## Why Use Brevo API Instead of SMTP?

**Render and many other deployment platforms block SMTP ports (587, 465, 25)**. This causes connection timeout errors like:
```
Error: Connection timeout
Error code: ETIMEDOUT
```

**Solution:** Use Brevo's API instead of SMTP. The API uses HTTPS (port 443) which is never blocked.

---

## Step 1: Get Your Brevo API Key

1. **Log in to Brevo** (https://app.brevo.com)

2. **Navigate to Settings**
   - Click your profile icon (top right)
   - Select **"SMTP & API"** from the dropdown menu

3. **Go to API Keys Section**
   - In the left sidebar, click **"API Keys"**
   - You'll see a list of your existing API keys (if any)

4. **Create a New API Key**
   - Click **"Generate a new API key"** button
   - Give it a name (e.g., "Onboarding Tool Production")
   - Click **"Generate"**
   - **⚠️ IMPORTANT:** Copy the API key immediately - you won't be able to see it again!
   - The key will look like: `xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxx`

---

## Step 2: Set Environment Variables

### For Local Development (`backend/.env`):

```env
# Brevo API Configuration (preferred - no port blocking)
BREVO_API_KEY=xkeysib-your-api-key-here

# Optional: Set custom "from" email address
# If not set, will use SMTP_USER or noreply@sendinblue.com
BREVO_FROM_EMAIL=noreply@yourdomain.com

# Remove or comment out SMTP variables (not needed with API)
# SMTP_HOST=smtp-relay.brevo.com
# SMTP_PORT=587
# SMTP_USER=your-email@example.com
# SMTP_PASSWORD=your-smtp-password
```

### For Production (Render/Railway/Vercel):

1. **Go to your deployment platform's dashboard**
2. **Navigate to Environment Variables**
3. **Add these variables:**

   | Variable Name | Value | Required |
   |--------------|-------|----------|
   | `BREVO_API_KEY` | Your Brevo API key (from Step 1) | ✅ Yes |
   | `BREVO_FROM_EMAIL` | Email address to send from (optional) | ❌ No |

4. **Remove or keep SMTP variables:**
   - You can keep `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` if you want
   - The code will automatically prefer the API over SMTP
   - If API is available, SMTP won't be used

---

## Step 3: Deploy

After setting the environment variables:

1. **Commit and push your code** (already done ✅)
2. **Redeploy your backend** on Render/Railway
3. **Check logs** - you should see:
   ```
   [Email] ✅ Brevo API client initialized (using API instead of SMTP)
   ```

---

## Priority Order

The email service uses this priority order:

1. **Brevo API** (if `BREVO_API_KEY` is set) ← **Use this!**
2. Resend API (if `RESEND_API_KEY` is set)
3. Brevo SMTP (if `SMTP_HOST=smtp-relay.brevo.com`)
4. Other SMTP providers

---

## Testing

After deployment, assign a mentor to a mentee from the Admin panel. Check the backend logs:

**✅ Success:**
```
[Email] 📧 Using Brevo API (no SMTP port needed)...
[Email] ✅ Email sent successfully to mentor via Brevo API: mentor@example.com
[Email]    Message ID: 12345678-1234-1234-1234-123456789012
[Email] ✅ Email sent successfully to mentee via Brevo API: mentee@example.com
```

**❌ Error (if API key is wrong):**
```
[Email] ❌ Failed to send email to mentor via Brevo API: Invalid API key
```

---

## Troubleshooting

### "Invalid API key" Error
- Double-check that `BREVO_API_KEY` is set correctly
- Make sure there are no extra spaces or quotes
- Regenerate the API key in Brevo dashboard if needed

### "Sender email not verified" Error
- Brevo allows sending from `noreply@sendinblue.com` by default
- Or use your Brevo account email address
- To use a custom domain, verify it in Brevo: Settings → Senders & IP → Domains

### Still Getting SMTP Timeout Errors?
- Make sure `BREVO_API_KEY` is set in your deployment platform
- Remove `RESEND_API_KEY` if you're not using Resend
- Check backend logs to confirm: `[Email] ✅ Brevo API client initialized`

---

## Benefits of Using Brevo API

✅ **No port blocking** - Uses HTTPS (port 443)  
✅ **No domain verification required** for free tier  
✅ **Better error messages** - API returns detailed error responses  
✅ **Higher reliability** - No SMTP connection issues  
✅ **Free tier:** 300 emails/day

---

## Need Help?

- Brevo API Documentation: https://developers.brevo.com/docs
- Brevo Dashboard: https://app.brevo.com
- Check backend logs for detailed error messages
