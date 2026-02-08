# 🔐 Login Credentials

## 🌐 Frontend URL
**http://localhost:3000**

---

## 🔑 Login Method

**ALL users (including Admin) login using their NAME and PASSWORD.**

- **Name-based login:** All users must login with their name, not email
- **Email collection:** After first login, users will be prompted to enter their email address
- **@encord.ai users:** Users with @encord.ai emails are created with NULL email initially - they will enter their own personal email after first login

---

## 👥 Test Users

### 🔴 Admin User
- **Name:** `admin`
- **Password:** `admin`
- **Role:** ADMIN
- **Can:** Create users, assign mentors/mentees, view all reports

### 🟡 Mentor User
- **Name:** `Mentor User`
- **Password:** `mentor123`
- **Role:** MENTOR
- **Can:** View mentee progress, track mentee activities

### 🟢 Trainee Users
**Trainee 1:**
- **Name:** `Trainee User`
- **Password:** `trainee123`
- **Role:** TRAINEE

**Trainee 2:**
- **Name:** `Trainee User 2`
- **Password:** `trainee123`
- **Role:** TRAINEE

---

## 🚀 Quick Start

1. **Open Frontend:** http://localhost:3000
2. **Login as Admin:** Use `admin` / `admin`
3. **Assign Mentor-Mentee:** Go to Admin Panel → Assign mentor to trainees
4. **Login as Mentor:** Use `Mentor User` / `mentor123` to view mentees
5. **Login as Trainee:** Use `Trainee User` / `trainee123` to access dashboard
6. **First Login:** After logging in, you'll be prompted to enter your email address

---

## 📝 Notes

- Admin can assign mentors to trainees through the admin panel
- Once a mentor is assigned, Day 1 starts automatically for the trainee
- Trainees without mentors can access materials but progress won't be tracked
- All users can login and access their respective dashboards

---

**Frontend:** http://localhost:3000  
**Backend API:** http://localhost:5000/api
