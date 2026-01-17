-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('TRAINEE', 'MENTOR', 'ADMIN');
CREATE TYPE day_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE quiz_type AS ENUM ('MINI_QUIZ_1', 'MINI_QUIZ_2', 'DAY_END_QUIZ', 'FINAL_ASSESSMENT');
CREATE TYPE task_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  roles user_role[] DEFAULT ARRAY['TRAINEE']::user_role[],
  "isActive" BOOLEAN DEFAULT true,
  "mentorId" UUID REFERENCES users(id) ON DELETE SET NULL,
  "programStartDate" TIMESTAMP,
  "currentDay" INTEGER DEFAULT 1,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Mentor history table
CREATE TABLE mentor_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "mentorId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "assignedAt" TIMESTAMP DEFAULT NOW(),
  "assignedBy" VARCHAR(255) NOT NULL,
  "removedAt" TIMESTAMP
);

-- Progress table
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 7),
  status day_status DEFAULT 'NOT_STARTED',
  "startedAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "miniQuiz1Score" FLOAT,
  "miniQuiz2Score" FLOAT,
  "dayEndQuizScore" FLOAT,
  "tasksCompleted" INTEGER DEFAULT 0,
  "tasksTotal" INTEGER DEFAULT 0,
  "dayProgress" INTEGER DEFAULT 0 CHECK ("dayProgress" >= 0 AND "dayProgress" <= 100),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("userId", day)
);

-- Quizzes table
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  "quizType" quiz_type NOT NULL,
  questions JSONB NOT NULL,
  answers JSONB NOT NULL,
  score FLOAT NOT NULL,
  "maxScore" FLOAT NOT NULL,
  percentage FLOAT NOT NULL,
  attempts INTEGER DEFAULT 1,
  "bestScore" FLOAT NOT NULL,
  "completedAt" TIMESTAMP DEFAULT NOW(),
  "timeTaken" INTEGER
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  "taskUrl" TEXT NOT NULL,
  "taskName" VARCHAR(255) NOT NULL,
  status task_status DEFAULT 'NOT_STARTED',
  "completedAt" TIMESTAMP,
  "submittedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_mentor ON users("mentorId");
CREATE INDEX idx_progress_user_day ON progress("userId", day);
CREATE INDEX idx_quizzes_user_day ON quizzes("userId", day);
CREATE INDEX idx_tasks_user_day ON tasks("userId", day);
CREATE INDEX idx_mentor_history_user ON mentor_history("userId");

-- Create function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
