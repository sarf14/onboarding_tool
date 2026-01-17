# Onboarding Platform - Requirements Document

## 1. Project Overview

### 1.1 Purpose
A comprehensive 7-day onboarding platform for Autonex Annotation & QC Training that provides structured learning paths, progress tracking, mentor-mentee management, and administrative oversight.

### 1.2 Key Features
- User dashboard with progress tracking
- Admin panel for user and mentor management
- Mentor dashboard for mentee oversight
- Self-paced learning mode
- Task assignment and tracking
- Quiz system with assessments
- Report generation and download

---

## 2. User Roles & Permissions

### 2.1 User Roles

#### 2.1.1 Trainee (Default Role)
- **Access:** Own dashboard, course materials, quizzes, tasks
- **Permissions:**
  - View own progress
  - Access assigned day content
  - Complete quizzes and tasks
  - View own reports
  - Can be assigned as mentee

#### 2.1.2 Mentor
- **Access:** Mentor dashboard, mentee progress, mentee reports
- **Permissions:**
  - View all assigned mentees
  - View mentee progress and reports
  - Download mentee reports
  - Provide feedback (optional)
  - Cannot assign themselves as mentor

#### 2.1.3 Admin
- **Access:** Admin panel, all user data, all reports
- **Permissions:**
  - View all users
  - Assign mentors to mentees
  - Remove mentor-mentee relationships
  - Download any user's reports
  - View system analytics
  - Manage course content
  - Manage users (create, edit, delete)

### 2.2 Role Assignment Rules
- Users can be: **Trainee only**, **Mentor only**, or **Admin**
- **IMPORTANT:** A user CANNOT be both mentor and mentee simultaneously
- A user cannot be their own mentor
- Admin can assign/remove mentor-mentee relationships
- Users without mentor/mentee assignment = Self-paced mode (no tracking)
- **Day 1 starts when mentor is assigned** - The 7-day program begins from mentor assignment date
- **Mentor changes don't reset progress** - If mentor is reassigned, the program continues from current day

---

## 3. Authentication & Authorization

### 3.1 Login System
- **Method:** Email/Username + Password
- **Session Management:** JWT tokens or session-based
- **Password Requirements:** Minimum 8 characters, complexity rules
- **Password Reset:** Email-based reset flow

### 3.2 Authorization Flow
1. User logs in
2. System checks role
3. Redirects to appropriate dashboard:
   - Trainee → Trainee Dashboard
   - Mentor → Mentor Dashboard
   - Admin → Admin Panel
   - Multiple roles → Role selection screen

---

## 4. Trainee Dashboard

### 4.1 Dashboard Overview

#### 4.1.1 Header Section
- User name and avatar
- Current day in program (e.g., "Day 3 of 7")
- Overall progress percentage
- Logout button

#### 4.1.2 Progress Overview Card
- **Visual Elements:**
  - Progress bar showing completion percentage
  - Days completed vs total days (e.g., "3/7 days completed")
  - Current status badge (e.g., "In Progress", "Completed", "Not Started")
  
- **Metrics Display:**
  - Quizzes completed: X/Y
  - Tasks completed: X/Y
  - Average quiz score: XX%
  - Days remaining: X days

#### 4.1.3 Timeline Chart
- **Purpose:** Visual planning tool for trainees
- **Features:**
  - Interactive calendar/timeline view
  - Shows all 7 days
  - Visual indicators:
    - ✅ Completed days (green)
    - 🔄 Current day (blue)
    - ⏳ Upcoming days (gray)
    - ⚠️ Overdue days (red)
  - Click on day to navigate to day content
  - Hover tooltip showing day summary

#### 4.1.4 Quick Access Cards
- **Today's Content:** Direct link to current day
- **Upcoming Quiz:** Next quiz notification
- **Pending Tasks:** Tasks awaiting completion
- **Recent Activity:** Last completed items

#### 4.1.5 Course Progress Section
- **Day-by-Day Breakdown:**
  - Day 1: ✅ Completed (100%)
  - Day 2: ✅ Completed (100%)
  - Day 3: 🔄 In Progress (60%)
  - Day 4: ⏳ Not Started
  - Day 5: ⏳ Not Started
  - Day 6: ⏳ Not Started
  - Day 7: ⏳ Not Started

- **Each Day Card Shows:**
  - Day number and title
  - Completion status
  - Mini quizzes completed
  - Day-end quiz status
  - Tasks completed
  - Click to access day content

#### 4.1.6 Mentor Information (If Assigned)
- **Mentor Card:**
  - Mentor name and avatar
  - Contact information
  - "View Mentor Dashboard" link (if mentor has shared)
  - "Request Help" button

### 4.2 Day Content Page

#### 4.2.1 Day Header
- Day number and title
- Estimated duration
- Progress indicator for current day

#### 4.2.2 Content Sections
- **Morning Session:**
  - Topics covered
  - Reading materials
  - Videos (embedded)
  - Documents (downloadable)
  - Mini Quiz 1 (after session)

- **Afternoon Session:**
  - Topics covered
  - Activities
  - Practice tasks
  - Mini Quiz 2 (after session)

- **Day-End Mega Quiz:**
  - Comprehensive quiz
  - Score display
  - Retake options

#### 4.2.3 Task Assignment Section
- **Task URLs:**
  - List of tasks for the day
  - External links to task platforms
  - Task completion status
  - Submit completion button

#### 4.2.4 Navigation
- Previous Day button
- Next Day button
- Back to Dashboard button

### 4.3 Quiz System

#### 4.3.1 Quiz Types
- **Mini Quiz:** After each lesson (5-15 questions)
- **Day-End Mega Quiz:** Comprehensive daily review (25-30 questions)
- **Final Assessment:** End of program (100 questions)

#### 4.3.2 Quiz Features
- Multiple choice questions
- Timer (optional)
- Progress indicator
- Review answers before submission
- Immediate feedback on completion
- Score display
- Retake options (limited attempts)
- Answer explanations (after completion)

#### 4.3.3 Quiz Tracking
- Quiz attempts logged
- Best score recorded
- Completion status tracked
- Time taken recorded

---

## 5. Mentor Dashboard

### 5.1 Dashboard Overview

#### 5.1.1 Header Section
- Mentor name
- Number of assigned mentees
- Quick stats overview

#### 5.1.2 Mentees List
- **Card for Each Mentee:**
  - Mentee name and avatar
  - Current day in program
  - Overall progress percentage
  - Status badge (On Track, At Risk, Completed)
  - Last activity timestamp
  - Quick action buttons:
    - View Progress
    - Download Report
    - Send Message (optional)

#### 5.1.3 Mentee Progress View
- **When Clicking on Mentee:**
  - Detailed progress breakdown
  - Day-by-day completion status
  - Quiz scores and attempts
  - Task completion status
  - Timeline visualization
  - Performance trends chart
  - Download full report button

#### 5.1.4 Reports Section
- **Available Reports:**
  - Progress Report (PDF)
  - Quiz Performance Report
  - Task Completion Report
  - Comprehensive Report (All data)

- **Report Features:**
  - Downloadable PDF
  - Date range selection
  - Customizable sections
  - Export to Excel/CSV option

#### 5.1.5 Analytics Overview
- Average progress across all mentees
- Mentees at risk (low progress)
- Mentees on track
- Completion rates

---

## 6. Admin Panel

### 6.1 Dashboard Overview

#### 6.1.1 System Overview
- Total users
- Active trainees
- Mentors count
- Completion rates
- System-wide analytics

#### 6.1.2 User Management Section

##### 6.1.2.1 User List
- **Table View:**
  - User ID
  - Name
  - Email
  - Role(s)
  - Current Day
  - Progress %
  - Status (Active/Inactive)
  - Mentor/Mentee status
  - Actions (Edit, Delete, View Reports)

- **Filters:**
  - By role
  - By progress status
  - By mentor assignment
  - By date range
  - Search by name/email

##### 6.1.2.2 User Details Page
- Full user profile
- Progress history
- Quiz scores
- Task completions
- Download all reports
- Edit user details
- Change password
- Assign/remove roles

### 6.2 Mentor-Mentee Management

#### 6.2.1 Assignment Interface
- **Mentor Selection:**
  - Dropdown/searchable list of mentors
  - Shows current mentee count
  - Shows mentor capacity (if set)

- **Mentee Selection:**
  - Multi-select list of trainees
  - Shows current mentor (if any)
  - Filter by status

- **Assignment Actions:**
  - Assign mentor to mentee(s)
  - Remove assignment
  - Bulk assign (multiple mentees to one mentor)
  - View assignment history

#### 6.2.2 Assignment Rules
- One mentor can have multiple mentees
- One mentee can have only one mentor
- Cannot assign mentor to themselves
- Admin can reassign mentors
- Assignment changes logged

#### 6.2.3 Assignment View
- **Visual Representation:**
  - Tree/hierarchy view
  - Mentor → Mentees list
  - Search functionality
  - Filter by mentor

### 6.3 Reports & Analytics

#### 6.3.1 User Reports
- Select any user
- Generate reports:
  - Progress Report
  - Quiz Performance
  - Task Completion
  - Comprehensive Report
- Download options (PDF, Excel, CSV)
- Email reports (optional)

#### 6.3.2 System Analytics
- Overall completion rates
- Average time to complete
- Quiz performance trends
- Task completion rates
- Mentor effectiveness metrics
- User engagement metrics

### 6.4 Content Management (Optional)
- Manage course content
- Update day materials
- Add/remove quizzes
- Update task URLs
- Version control for content

---

## 7. Self-Paced Mode

### 7.1 Access Conditions
- User is not assigned as mentor
- User is not assigned as mentee
- User has access to all materials

### 7.2 Features
- **Available:**
  - All course materials
  - All videos and documents
  - All quizzes (for practice)
  - Task URLs (for reference)

- **Not Available:**
  - Progress tracking
  - Quiz score recording
  - Task completion tracking
  - Reports generation
  - Timeline enforcement
  - Day-by-day restrictions

### 7.3 User Experience
- Dashboard shows: "Self-Paced Mode"
- All content accessible immediately
- No progress bars or completion tracking
- Quizzes available but scores not saved
- Can navigate freely between days

---

## 8. Data Models

### 8.1 User Model
```javascript
{
  id: UUID,
  email: String (unique),
  password: String (hashed),
  name: String,
  role: Array[String], // ['trainee', 'mentor', 'admin']
  createdAt: DateTime,
  updatedAt: DateTime,
  isActive: Boolean,
  mentorId: UUID (nullable),
  mentees: Array[UUID],
  profile: {
    avatar: String (URL),
    phone: String (optional),
    department: String (optional)
  }
}
```

### 8.2 Progress Model
```javascript
{
  id: UUID,
  userId: UUID,
  day: Number (1-7),
  status: String, // 'not_started', 'in_progress', 'completed'
  programStartDate: DateTime, // Set when mentor is first assigned
  startedAt: DateTime,
  completedAt: DateTime (nullable),
  miniQuiz1Score: Number (nullable),
  miniQuiz2Score: Number (nullable),
  dayEndQuizScore: Number (nullable),
  tasksCompleted: Number,
  tasksTotal: Number,
  dayProgress: Number (0-100),
  currentMentorId: UUID (nullable), // Can change without resetting progress
  previousMentors: Array[UUID] // Track mentor history
}
```

### 8.3 Quiz Model
```javascript
{
  id: UUID,
  userId: UUID,
  day: Number,
  quizType: String, // 'mini1', 'mini2', 'day_end', 'final'
  questions: Array[Question],
  answers: Array[Answer],
  score: Number,
  maxScore: Number,
  percentage: Number,
  attempts: Number,
  bestScore: Number,
  completedAt: DateTime,
  timeTaken: Number (seconds)
}
```

### 8.4 Task Model
```javascript
{
  id: UUID,
  userId: UUID,
  day: Number,
  taskUrl: String,
  taskName: String,
  status: String, // 'not_started', 'in_progress', 'completed'
  completedAt: DateTime (nullable),
  submittedAt: DateTime (nullable)
}
```

### 8.5 Mentor-Mentee Relationship Model
```javascript
{
  id: UUID,
  mentorId: UUID,
  menteeId: UUID,
  assignedAt: DateTime,
  assignedBy: UUID (admin user),
  status: String, // 'active', 'inactive'
  notes: String (optional)
}
```

---

## 9. User Flows

### 9.1 Trainee Flow
1. **Login** → Trainee Dashboard
2. **View Progress** → See timeline and completion status
3. **Access Day Content** → Click on day card or timeline
4. **Complete Lesson** → Read materials, watch videos
5. **Take Mini Quiz** → Complete quiz after lesson
6. **Complete Tasks** → Access task URLs, mark as complete
7. **Take Day-End Quiz** → Complete comprehensive quiz
8. **View Reports** → Download own progress reports
9. **Navigate to Next Day** → Continue to next day

### 9.2 Mentor Flow
1. **Login** → Mentor Dashboard
2. **View Mentees List** → See all assigned mentees
3. **Select Mentee** → View detailed progress
4. **Review Progress** → Check day-by-day completion
5. **Download Reports** → Generate and download mentee reports
6. **Monitor Performance** → Track quiz scores and task completion

### 9.3 Admin Flow
1. **Login** → Admin Panel
2. **View All Users** → See user list with filters
3. **Manage Users** → Create, edit, delete users
4. **Assign Mentors** → Select mentor and mentee(s), assign
5. **View Reports** → Select any user, download reports
6. **System Analytics** → View overall metrics

### 9.4 Self-Paced Flow
1. **Login** → Dashboard (shows "Self-Paced Mode")
2. **Access Any Content** → No restrictions
3. **Browse Materials** → Free navigation
4. **Take Quizzes** → Practice mode (scores not saved)
5. **View Task URLs** → Reference only

---

## 10. Technical Requirements

### 10.1 Frontend
- **Framework:** React.js / Next.js
- **UI Library:** Material-UI / Tailwind CSS / Ant Design
- **State Management:** Redux / Zustand / Context API
- **Charts:** Chart.js / Recharts / D3.js
- **Forms:** React Hook Form / Formik
- **Routing:** React Router

### 10.2 Backend
- **Framework:** Node.js / Express / NestJS
- **Database:** PostgreSQL / MongoDB
- **Authentication:** JWT / Passport.js
- **File Storage:** AWS S3 / Local storage
- **PDF Generation:** PDFKit / Puppeteer
- **Email:** Nodemailer / SendGrid

### 10.3 Features to Implement
- RESTful API or GraphQL
- Real-time updates (WebSockets - optional)
- File upload/download
- PDF report generation
- Email notifications
- Data export (CSV, Excel)
- Search and filtering
- Pagination
- Responsive design (mobile-friendly)

---

## 11. Security Requirements

### 11.1 Authentication
- Secure password hashing (bcrypt)
- JWT token expiration
- Password reset flow
- Session management

### 11.2 Authorization
- Role-based access control (RBAC)
- Route protection
- API endpoint protection
- Data access restrictions

### 11.3 Data Security
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Secure file uploads
- Data encryption at rest

---

## 12. Performance Requirements

### 12.1 Response Times
- Page load: < 2 seconds
- API response: < 500ms
- Report generation: < 5 seconds
- Search results: < 1 second

### 12.2 Scalability
- Support 100+ concurrent users
- Database indexing
- Caching strategy
- CDN for static assets

---

## 13. UI/UX Requirements

### 13.1 Design Principles
- Clean and modern interface
- Intuitive navigation
- Consistent color scheme
- Accessible (WCAG 2.1 AA)
- Mobile responsive

### 13.2 Color Scheme
- Primary: Blue (#163791, #62AADE) - from existing design
- Success: Green
- Warning: Orange/Yellow
- Error: Red
- Background: Dark theme (black/gray) - from existing design

### 13.3 Components
- Dashboard cards
- Progress bars
- Timeline/calendar view
- Data tables
- Charts and graphs
- Forms and inputs
- Modals and dialogs
- Navigation menus

---

## 14. Reporting Features

### 14.1 Report Types
1. **Progress Report:**
   - Overall completion percentage
   - Day-by-day breakdown
   - Quiz scores
   - Task completion status
   - Timeline visualization

2. **Quiz Performance Report:**
   - All quiz scores
   - Attempts per quiz
   - Average scores
   - Performance trends
   - Weak areas identified

3. **Task Completion Report:**
   - Tasks completed per day
   - Completion rate
   - Time taken per task
   - Task URLs accessed

4. **Comprehensive Report:**
   - All above data combined
   - Detailed analytics
   - Recommendations
   - Export options

### 14.2 Report Formats
- PDF (formatted, printable)
- Excel/CSV (data analysis)
- HTML (web view)
- JSON (API access)

---

## 15. Notifications (Optional)

### 15.1 Email Notifications
- Welcome email
- Daily reminders
- Quiz completion
- Task assignments
- Mentor assignment
- Progress milestones

### 15.2 In-App Notifications
- New assignments
- Quiz deadlines
- Mentor messages
- System updates

---

## 16. Future Enhancements (Phase 2)

- Chat/messaging system between mentor and mentee
- Video conferencing integration
- Advanced analytics dashboard
- Gamification (badges, leaderboards)
- Mobile app
- Offline mode
- Multi-language support
- Integration with external platforms (Yutori, Encord)

---

## 17. Success Metrics

### 17.1 User Engagement
- Daily active users
- Completion rates
- Average time spent
- Quiz attempt rates

### 17.2 Learning Outcomes
- Average quiz scores
- Task completion rates
- Time to complete program
- Mentor satisfaction

### 17.3 System Performance
- Uptime percentage
- Error rates
- Response times
- User satisfaction scores

---

## 18. Project Timeline (Estimated)

### Phase 1: Core Features (4-6 weeks)
- Authentication & Authorization
- User Dashboard
- Day Content Pages
- Basic Quiz System
- Admin Panel (User Management)

### Phase 2: Advanced Features (2-3 weeks)
- Mentor Dashboard
- Mentor-Mentee Assignment
- Reports Generation
- Timeline Chart
- Task Tracking

### Phase 3: Polish & Testing (2 weeks)
- UI/UX improvements
- Testing
- Bug fixes
- Performance optimization
- Documentation

**Total Estimated Time: 8-11 weeks**

---

## 19. Questions for Clarification

1. Should mentors be able to communicate with mentees directly?
2. Can a user be both mentor and trainee simultaneously?
3. What happens to progress if mentor is reassigned?
4. Should there be deadlines for each day?
5. Can admins edit course content through the platform?
6. Should quiz answers be shown immediately or after completion?
7. What file formats for document uploads?
8. Should there be a mobile app or mobile-responsive web only?
9. Integration with existing platforms (Yutori, Encord)?
10. Should reports be scheduled/automated?

---

This requirements document covers all the features you mentioned. Should we proceed with building the application, or would you like to clarify/modify any requirements first?
