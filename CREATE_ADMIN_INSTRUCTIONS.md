# 🔧 Create Admin User

## Option 1: Use API Endpoint (Easiest)

Make a POST request to create the admin user:

### Using curl:
```bash
curl -X POST http://localhost:5000/api/auth/create-admin
```

### Using browser/Postman:
1. Open: `http://localhost:5000/api/auth/create-admin`
2. Method: POST
3. Send request

### Using JavaScript (from browser console):
```javascript
fetch('http://localhost:5000/api/auth/create-admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

## Option 2: Run Script

```bash
cd backend
npx ts-node scripts/create-admin-user.ts
```

## After Creating Admin

Login with:
- **Name:** `admin`
- **Password:** `admin`

## What This Does

- Creates a user named `admin`
- Sets password to `admin`
- Assigns ADMIN role
- Sets email to null (you'll be prompted to enter email after first login)
