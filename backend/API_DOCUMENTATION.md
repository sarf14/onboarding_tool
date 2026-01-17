# API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-api-domain.com/api
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### POST /api/auth/register
Register a new user (Admin only)

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name",
  "roles": ["TRAINEE"]
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "roles": ["TRAINEE"]
  }
}
```

### POST /api/auth/login
Login and get JWT token

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "roles": ["TRAINEE"]
  }
}
```

### GET /api/auth/me
Get current user information

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "roles": ["TRAINEE"],
    "mentorId": "uuid",
    "programStartDate": "2024-01-15T00:00:00Z",
    "currentDay": 1
  }
}
```

---

## User Endpoints

### GET /api/users
Get all users (Admin only)

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)
- `role` - Filter by role (TRAINEE, MENTOR, ADMIN)
- `search` - Search by name or email

**Response:**
```json
{
  "users": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

### GET /api/users/:id
Get user by ID

### PUT /api/users/:id
Update user (Admin or self)

**Request:**
```json
{
  "name": "Updated Name",
  "password": "newpassword" // optional
}
```

### DELETE /api/users/:id
Delete user (Admin only)

---

## Progress Endpoints

### GET /api/progress/me
Get current user's progress

**Response:**
```json
{
  "progress": [
    {
      "id": "uuid",
      "day": 1,
      "status": "COMPLETED",
      "dayProgress": 100,
      "miniQuiz1Score": 85,
      "miniQuiz2Score": 90,
      "dayEndQuizScore": 88,
      "tasksCompleted": 5,
      "tasksTotal": 5
    }
  ],
  "overallProgress": 42,
  "completedDays": 3,
  "totalDays": 7,
  "currentDay": 4,
  "programStartDate": "2024-01-15T00:00:00Z"
}
```

### GET /api/progress/:userId
Get progress for specific user (Mentor/Admin)

### PUT /api/progress/day/:day
Update progress for a day

**Request:**
```json
{
  "status": "IN_PROGRESS",
  "miniQuiz1Score": 85,
  "miniQuiz2Score": 90,
  "dayEndQuizScore": 88,
  "tasksCompleted": 3,
  "tasksTotal": 5
}
```

---

## Mentor Endpoints

### POST /api/mentors/assign
Assign mentor to mentee(s) (Admin only)

**Request:**
```json
{
  "mentorId": "uuid",
  "menteeIds": ["uuid1", "uuid2"]
}
```

**Response:**
```json
{
  "message": "Mentor assigned successfully",
  "assignments": [
    {
      "menteeId": "uuid1",
      "mentorId": "uuid",
      "programStartDate": "2024-01-15T00:00:00Z"
    }
  ]
}
```

### DELETE /api/mentors/remove/:menteeId
Remove mentor assignment (Admin only)

### GET /api/mentors/mentees
Get all mentees for current mentor

**Query Parameters:**
- `mentorId` - Get mentees for specific mentor (Admin only)

**Response:**
```json
{
  "mentees": [
    {
      "id": "uuid",
      "name": "Mentee Name",
      "email": "mentee@example.com",
      "currentDay": 3,
      "progress": 42,
      "completedDays": 3
    }
  ]
}
```

### GET /api/mentors/all
Get all mentors (Admin only)

---

## Quiz Endpoints

### POST /api/quizzes/submit
Submit quiz

**Request:**
```json
{
  "day": 1,
  "quizType": "MINI_QUIZ_1",
  "questions": [
    {
      "id": 1,
      "question": "What is...?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A"
    }
  ],
  "answers": ["A", "B", "C"],
  "timeTaken": 300
}
```

**Response:**
```json
{
  "message": "Quiz submitted successfully",
  "quiz": {
    "id": "uuid",
    "score": 2,
    "maxScore": 3,
    "percentage": 67,
    "attempts": 1,
    "bestScore": 67
  }
}
```

### GET /api/quizzes/results
Get quiz results for current user

**Query Parameters:**
- `day` - Filter by day (1-7)
- `quizType` - Filter by quiz type

### GET /api/quizzes/results/:userId
Get quiz results for specific user (Mentor/Admin)

---

## Task Endpoints

### GET /api/tasks/day/:day
Get tasks for a specific day

**Response:**
```json
{
  "tasks": [
    {
      "id": "uuid",
      "day": 1,
      "taskUrl": "https://...",
      "taskName": "Task 1",
      "status": "COMPLETED",
      "completedAt": "2024-01-15T00:00:00Z"
    }
  ]
}
```

### POST /api/tasks
Create task

**Request:**
```json
{
  "day": 1,
  "taskUrl": "https://...",
  "taskName": "Task 1",
  "userId": "uuid" // optional, admin only
}
```

### PUT /api/tasks/:id
Update task status

**Request:**
```json
{
  "status": "COMPLETED"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable
