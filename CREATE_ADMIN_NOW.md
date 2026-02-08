# 🚀 Create Admin User - Quick Instructions

## Method 1: Use the HTML Page (Easiest)

1. **Open the file:** `create-admin.html` in your browser
2. **Click the button:** "Create Admin User"
3. **Done!** You'll see a success message

## Method 2: Browser Console

1. **Open your browser** and go to your frontend (http://localhost:3000)
2. **Press F12** to open Developer Tools
3. **Go to Console tab**
4. **Paste this code** and press Enter:

```javascript
fetch('http://localhost:5000/api/auth/create-admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Success:', data);
  alert('Admin user created! Login with: admin / admin');
})
.catch(err => {
  console.error('❌ Error:', err);
  alert('Error: ' + err.message);
});
```

## Method 3: PowerShell (Windows)

Open PowerShell and run:

```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/create-admin" -Method POST -ContentType "application/json"
```

## After Creating Admin

Login with:
- **Name:** `admin`
- **Password:** `admin`

## Troubleshooting

If you get an error:
1. **Make sure backend is running** on port 5000
2. **Check backend console** for any error messages
3. **Verify database connection** is working

The admin user will be created with:
- Name: `admin`
- Password: `admin`  
- Role: `ADMIN`
- Email: `null` (you'll be prompted to enter email after first login)
