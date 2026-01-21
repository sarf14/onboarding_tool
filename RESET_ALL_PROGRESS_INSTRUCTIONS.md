# Reset All User Progress - Instructions

## Endpoint Created
**POST** `/api/admin/reset-all-progress`

This endpoint will:
1. Delete ALL progress records for ALL users
2. Delete ALL quiz records for ALL users  
3. Reset `currentDay` to 1 for ALL users

## How to Use

### Option 1: Using Postman/Thunder Client
1. Make a POST request to: `https://your-backend-url/api/admin/reset-all-progress`
2. Add Authorization header: `Bearer YOUR_ADMIN_JWT_TOKEN`
3. Send the request

### Option 2: Using curl (if you have admin token)
```bash
curl -X POST https://your-backend-url/api/admin/reset-all-progress \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Option 3: From Admin Panel (if you add a button)
You can add a button in the admin panel that calls this endpoint.

## Response
```json
{
  "message": "Successfully reset progress for ALL X users",
  "resetCount": X,
  "userIds": ["user-id-1", "user-id-2", ...]
}
```

## ⚠️ Warning
This action is **irreversible** and will delete ALL progress and quiz data for ALL users. Use with caution!
