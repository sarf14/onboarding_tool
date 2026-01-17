# System Architecture Overview

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React/Next.js)                │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Trainee    │  │    Mentor    │  │    Admin    │         │
│  │  Dashboard   │  │  Dashboard   │  │    Panel    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                │
│         └──────────────────┼──────────────────┘                │
│                            │                                    │
│                    ┌───────▼────────┐                          │
│                    │  Authentication │                          │
│                    │   & Routing     │                          │
│                    └───────┬────────┘                          │
└────────────────────────────┼────────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │   API Gateway     │
                    │   (Express/Node)  │
                    └────────┬──────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│   User API     │  │  Progress API   │  │  Reports API   │
│  Management   │  │   Tracking       │  │  Generation     │
└───────┬────────┘  └────────┬────────┘  └───────┬────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │    Database      │
                    │  (PostgreSQL/    │
                    │    MongoDB)      │
                    └──────────────────┘
```

## User Flow Diagrams

### Trainee Flow
```
Login
  │
  ├─→ Dashboard
  │     │
  │     ├─→ View Progress
  │     ├─→ Timeline Chart
  │     └─→ Quick Access
  │
  ├─→ Day Content
  │     │
  │     ├─→ Morning Session
  │     │     ├─→ Read Materials
  │     │     ├─→ Watch Videos
  │     │     └─→ Mini Quiz 1
  │     │
  │     ├─→ Afternoon Session
  │     │     ├─→ Activities
  │     │     ├─→ Tasks
  │     │     └─→ Mini Quiz 2
  │     │
  │     └─→ Day-End Quiz
  │
  └─→ Reports (Own)
```

### Mentor Flow
```
Login
  │
  ├─→ Mentor Dashboard
  │     │
  │     ├─→ View Mentees List
  │     │     │
  │     │     └─→ Select Mentee
  │     │           │
  │     │           ├─→ View Progress
  │     │           ├─→ View Reports
  │     │           └─→ Download Reports
  │     │
  │     └─→ Analytics Overview
  │
  └─→ Reports (Mentees)
```

### Admin Flow
```
Login
  │
  ├─→ Admin Panel
  │     │
  │     ├─→ User Management
  │     │     ├─→ View All Users
  │     │     ├─→ Create/Edit Users
  │     │     └─→ Delete Users
  │     │
  │     ├─→ Mentor-Mentee Assignment
  │     │     ├─→ Assign Mentor
  │     │     ├─→ Remove Assignment
  │     │     └─→ View Assignments
  │     │
  │     ├─→ Reports
  │     │     └─→ Download Any User Report
  │     │
  │     └─→ System Analytics
  │
  └─→ Content Management (Optional)
```

## Database Schema Relationships

```
Users
  │
  ├─→ Progress (1:7) ──→ One record per day
  │     │
  │     ├─→ Quiz Scores
  │     └─→ Task Completions
  │
  ├─→ Mentor Relationship (1:1) ──→ One mentor per user
  │
  └─→ Mentee Relationships (1:Many) ──→ Many mentees per mentor
```

## Component Structure

### Frontend Components
```
src/
├── components/
│   ├── common/
│   │   ├── Header
│   │   ├── Sidebar
│   │   ├── ProgressBar
│   │   └── TimelineChart
│   ├── dashboard/
│   │   ├── TraineeDashboard
│   │   ├── MentorDashboard
│   │   └── AdminDashboard
│   ├── quiz/
│   │   ├── QuizComponent
│   │   ├── QuestionCard
│   │   └── ResultsDisplay
│   └── reports/
│       ├── ReportGenerator
│       └── ReportViewer
├── pages/
│   ├── Login
│   ├── Dashboard
│   ├── DayContent
│   └── AdminPanel
└── services/
    ├── api
    ├── auth
    └── reports
```

## API Endpoints Structure

```
/api
├── /auth
│   ├── POST /login
│   ├── POST /logout
│   └── POST /reset-password
├── /users
│   ├── GET /me
│   ├── GET /:id
│   ├── PUT /:id
│   └── DELETE /:id
├── /progress
│   ├── GET /me
│   ├── GET /:userId
│   └── PUT /:day
├── /quizzes
│   ├── GET /:day/:type
│   ├── POST /submit
│   └── GET /results/:id
├── /tasks
│   ├── GET /:day
│   └── POST /complete
├── /mentors
│   ├── GET /mentees
│   ├── GET /mentee/:id/progress
│   └── GET /mentee/:id/report
├── /admin
│   ├── GET /users
│   ├── POST /assign-mentor
│   ├── DELETE /mentor-assignment
│   └── GET /analytics
└── /reports
    ├── GET /:userId
    └── POST /generate
```

## Technology Stack Recommendation

### Frontend
- **Framework:** Next.js 14 (React)
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand or React Query
- **Charts:** Recharts
- **Forms:** React Hook Form
- **PDF:** jsPDF or react-pdf

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js or NestJS
- **Database:** PostgreSQL (recommended) or MongoDB
- **ORM:** Prisma or TypeORM
- **Auth:** NextAuth.js or Passport.js
- **PDF:** PDFKit or Puppeteer

### Infrastructure
- **Hosting:** Vercel (Frontend) + Railway/Render (Backend)
- **Database:** Supabase or PlanetScale
- **Storage:** AWS S3 or Cloudinary
- **Email:** Resend or SendGrid

---

This architecture provides a scalable, maintainable structure for the onboarding platform.
