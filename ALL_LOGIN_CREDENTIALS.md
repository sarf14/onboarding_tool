# 🔐 Complete Login Credentials

## ⚠️ IMPORTANT: Login Method
**ALL users login using their NAME and PASSWORD (not email).**

After first login, users will be prompted to enter their email address.

---

## 🔴 ADMIN USERS

| Name | Password | Role |
|------|----------|------|
| admin | admin | ADMIN |

---

## 🟡 MENTOR USERS

| Name | Password | Role |
|------|----------|------|
| Mentor User | mentor123 | MENTOR |

---

## 🟢 TRAINEE/ANNOTATOR USERS

### Annotators (First List)

| Name | Password | Role |
|------|----------|------|
| annotator11 | 11 | TRAINEE |
| annotator14 | 14 | TRAINEE |
| annotator17 | 17 | TRAINEE |
| annotator24 | 24 | TRAINEE |
| annotator25 | 25 | TRAINEE |
| annotator26 | 26 | TRAINEE |
| annotator27 | 27 | TRAINEE |
| annotator28 | 28 | TRAINEE |
| annotator29 | 29 | TRAINEE |
| annotator30 | 30 | TRAINEE |
| annotator31 | 31 | TRAINEE |
| annotator32 | 32 | TRAINEE |
| annotator33 | 33 | TRAINEE |
| annotator34 | 34 | TRAINEE |
| annotator35 | 35 | TRAINEE |
| annotator36 | 36 | TRAINEE |
| annotator37 | 37 | TRAINEE |
| annotator38 | 38 | TRAINEE |
| annotator39 | 39 | TRAINEE |

### Annotators (Second List)

| Name | Password | Role |
|------|----------|------|
| annotator8 | 8 | TRAINEE |
| annotator9 | 9 | TRAINEE |
| annotator10 | 10 | TRAINEE |
| annotator12 | 12 | TRAINEE |
| annotator13 | 13 | TRAINEE |
| annotator15 | 15 | TRAINEE |
| annotator16 | 16 | TRAINEE |

### Test Trainees (from seed-users.ts)

| Name | Password | Role |
|------|----------|------|
| Trainee User | trainee123 | TRAINEE |
| Trainee User 2 | trainee123 | TRAINEE |

---

## 📊 Summary

- **Total Admin Users:** 1
- **Total Mentor Users:** 1
- **Total Trainee/Annotator Users:** 28
- **Grand Total:** 30 users

---

## 🚀 Quick Login Examples

### Admin Login:
- **Name:** `admin`
- **Password:** `admin`

### Mentor Login:
- **Name:** `Mentor User`
- **Password:** `mentor123`

### Annotator Login Examples:
- **Name:** `annotator11`
- **Password:** `11`

- **Name:** `annotator38`
- **Password:** `38`

- **Name:** `annotator8`
- **Password:** `8`

---

## 📝 Notes

1. **All users login with NAME, not email**
2. **@encord.ai users:** Created with NULL email - they will enter their personal email after first login
3. **After first login:** All users without email will be prompted to enter their email address
4. **Email is optional:** Users can login without email, but email is required for notifications

---

## 🔄 First Login Flow

1. User enters their **Name** and **Password**
2. User clicks "SIGN IN"
3. If user has no email, a modal appears asking for email
4. User enters their email address
5. Email is saved and user can access the dashboard

---

**Frontend URL:** http://localhost:3000  
**Backend API:** http://localhost:5000/api
