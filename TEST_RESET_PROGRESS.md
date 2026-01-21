# Test Reset All Progress

## Endpoint
**POST** `/api/admin/reset-all-progress`

## What It Does
1. ✅ Deletes ALL progress records for ALL users
2. ✅ Deletes ALL quiz records for ALL users
3. ✅ Deletes ALL activities records (if table exists)
4. ✅ Deletes ALL tasks records (if table exists)
5. ✅ Resets `currentDay` to 1 for ALL users
6. ✅ Verifies deletion and returns counts

## Response Format
```json
{
  "message": "Successfully reset progress for ALL X users",
  "resetCount": X,
  "userIds": ["id1", "id2", ...],
  "verification": {
    "remainingProgressRecords": 0,
    "remainingQuizRecords": 0,
    "allCleared": true
  }
}
```

## How to Use

### Step 1: Get Admin Token
Login as admin user and copy the JWT token from browser localStorage or API response.

### Step 2: Call the Endpoint
```bash
curl -X POST https://your-backend-url/api/admin/reset-all-progress \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Step 3: Verify
Check the response - `allCleared` should be `true` and both counts should be `0`.

### Step 4: Refresh Frontend
After resetting, users need to refresh their browser to see updated progress (0%).

## Troubleshooting

If progress still shows 100% after reset:
1. Check the API response - verify `allCleared: true`
2. Check browser console for any errors
3. Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)
4. Clear browser cache
5. Check if progress records actually exist in database

## Manual Database Check (if needed)
If you have direct database access, verify:
```sql
SELECT COUNT(*) FROM progress WHERE status = 'COMPLETED';
SELECT COUNT(*) FROM quizzes;
```
Both should return 0 after reset.
