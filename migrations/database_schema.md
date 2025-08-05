# Database Schema Documentation

This document describes the complete database schema for the novan-webapp application. The database uses PostgreSQL with Supabase and includes tables for user management, exercises, courses, achievements, notifications, and more.

## Table Structure

### 1. User Management

#### `profiles` Table
**Purpose**: Stores user profile information linked to Supabase Auth users.

```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,     -- User's first name
  last_name TEXT NOT NULL,      -- User's last name
  email text,                   -- User email
  role text DEFAULT 'trainee' CHECK (role IN ('trainer', 'trainee', 'admin')),
  class_id text,                -- Class identifier
  class_name text,              -- Class name
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  -- Additional profile fields:
  gender text,                  -- User's gender
  job text,                     -- User's job/profession
  education text,               -- User's education level
  phone_number text,            -- User's phone number
  country text,                 -- User's country
  city text,                    -- User's city
  birthday date,                -- User's birthday
  ai_familiarity text CHECK (ai_familiarity IN ('beginner', 'intermediate', 'advanced', 'expert')),
  english_level text CHECK (english_level IN ('beginner', 'intermediate', 'advanced', 'native')),
  whatsapp_id text,             -- User's WhatsApp ID
  telegram_id text,             -- User's Telegram ID
  is_demo boolean NOT NULL DEFAULT false, -- Marks user as demo/test account
  language_preference TEXT DEFAULT 'fa', -- User's language preference
  PRIMARY KEY (id)
);
```

**Note**: The `name` field has been removed and replaced with `first_name` and `last_name` fields.

**RLS Policies**:
- Users can view their own profile
- Users can update their own profile
- Users can insert their own profile

**Triggers**:
- `on_auth_user_created`: Automatically creates profile when user signs up

### 2. Exercise System

#### `exercises` Table
**Purpose**: Stores exercise definitions and metadata.

```sql
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'آسان', 'متوسط', 'سخت')),
  points INTEGER NOT NULL DEFAULT 100,
  estimated_time TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Additional fields from migrations:
  exercise_type TEXT DEFAULT 'form' CHECK (exercise_type IN ('form', 'video', 'audio', 'simple')),
  content_url TEXT,                   -- URL for media content
  auto_grade BOOLEAN DEFAULT FALSE,   -- Whether exercise is auto-graded
  course_id UUID NOT NULL,                     -- Foreign key to courses table (mandatory)
  form_structure JSONB DEFAULT '{"questions": []}', -- JSON structure for form-based exercises
  days_to_open INTEGER DEFAULT 0,     -- Number of days after creation when exercise opens
  days_to_due INTEGER DEFAULT 7,      -- Number of days after creation when exercise is due
  days_to_close INTEGER               -- Number of days after creation when exercise closes (optional)
);
```

**Indexes**:
- `idx_exercises_type`
- `idx_exercises_course_id` (if exists)

**Note**: The following fields have been removed:
- `course_name` (replaced with `course_id` foreign key)
- `due_date` (replaced with `days_to_due` relative days)
- `status` (removed entirely)

#### `exercise_submissions` Table
**Purpose**: Stores student submissions for exercises.

```sql
CREATE TABLE public.exercise_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) NOT NULL,
  course_id UUID REFERENCES public.courses(id), -- Foreign key to courses table
  solution TEXT NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by UUID REFERENCES auth.users(id),
  -- Additional fields from migrations:
  auto_graded BOOLEAN DEFAULT FALSE,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  UNIQUE(exercise_id, student_id)
);
```

**Indexes**:
- `idx_exercise_submissions_exercise_id`
- `idx_exercise_submissions_student_id`

**Note**: Name-related columns (`student_name`, `student_email`, `first_name`, `last_name`) have been removed as per the latest migration.

### 3. Achievement System

#### `awards` Table
**Purpose**: Defines available awards/achievements.

```sql
CREATE TABLE public.awards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,  -- Award code for translations
  icon TEXT NOT NULL,
  points_value INTEGER NOT NULL DEFAULT 0,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

**Award Categories**:
- Academic Performance
- Consistency & Dedication
- Progress & Improvement
- Engagement & Participation
- Special Recognition
- Milestone Awards

**Note**: The `name` and `description` fields have been removed. Award names and descriptions are now handled through frontend translations using the `code` field.

#### `student_awards` Table
**Purpose**: Tracks which awards students have earned.

```sql
CREATE TABLE public.student_awards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  award_id UUID NOT NULL REFERENCES public.awards(id),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  bonus_points INTEGER NOT NULL DEFAULT 0,
  UNIQUE(student_id, award_id)
);
```

**Achievement Functions**:
- `check_and_award_achievements(UUID)`: Checks and awards achievements based on student activity
- `trigger_check_achievements()`: Trigger function called after exercise submissions

### 4. Course Management

#### `courses` Table
**Purpose**: Stores course information.

```sql
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,                    -- Course name
  description TEXT,
  instructor_id UUID REFERENCES auth.users(id) NOT NULL,
  instructor_name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('active', 'upcoming', 'completed', 'inactive')),
  max_students INTEGER DEFAULT 50,
  price INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

#### `course_enrollments` Table
**Purpose**: Tracks student enrollments in courses.

```sql
CREATE TABLE public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  term_id UUID REFERENCES course_terms(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes**:
- `idx_course_enrollments_course_id`
- `idx_course_enrollments_student_id`
- `idx_course_enrollments_term_id`

#### `course_terms` Table
**Purpose**: Manages different terms/sessions for courses.

```sql
CREATE TABLE public.course_terms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  max_students INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

**RLS Policies**:
- Trainers can view, create, update, and delete terms for their courses

### 5. Accounting System

#### `accounting` Table
**Purpose**: Tracks financial transactions.

```sql
CREATE TABLE accounting (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL, -- Amount in Rials (positive for payments, negative for purchases)
  description TEXT,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_type TEXT NOT NULL DEFAULT 'buy_course' 
    CHECK (payment_type IN ('buy_course', 'discount', 'pay_money', 'refund')),
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes**:
- `idx_accounting_user_id`
- `idx_accounting_course_id`
- `idx_accounting_transaction_date`

### 6. Notifications System

#### `notifications` Table
**Purpose**: Stores user notifications.

```sql
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  receiver_id UUID NOT NULL REFERENCES auth.users(id),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ,
  link TEXT,
  type notification_type NOT NULL, -- ENUM: 'exercise_feedback', 'award_achieved', 'system'
  metadata JSONB DEFAULT '{}',
  sender_id UUID REFERENCES auth.users(id),
  priority TEXT DEFAULT 'normal',
  expires_at TIMESTAMPTZ,
  icon TEXT,
  CONSTRAINT valid_read_at CHECK (
    (is_read = false AND read_at IS NULL) OR
    (is_read = true AND read_at IS NOT NULL)
  )
);
```

**Indexes**:
- `idx_notifications_receiver_id`
- `idx_notifications_created_at`
- `idx_notifications_is_read`

### 9. Daily Activities

#### `daily_activities` Table
**Purpose**: Global daily tasks for students.

```sql
CREATE TABLE public.daily_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

**Indexes**:
- `idx_daily_activities_active`

### 10. Teacher Assignment System

#### `teacher_course_assignments` Table
**Purpose**: Manages teacher assignments to courses.

```sql
CREATE TABLE public.teacher_course_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  assigned_by uuid REFERENCES public.profiles(id),
  UNIQUE(teacher_id, course_id)
);
```

#### `teacher_term_assignments` Table
**Purpose**: Manages teacher assignments to specific course terms.

```sql
CREATE TABLE public.teacher_term_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  term_id uuid NOT NULL REFERENCES public.course_terms(id) ON DELETE CASCADE,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  assigned_by uuid REFERENCES public.profiles(id),
  UNIQUE(teacher_id, term_id)
);
```

**RLS Policies**:
- **Admins**: Can manage all teacher assignments
- **Teachers**: Can view their own course and term assignments

**Related Policies**:
- Teachers can view courses they are assigned to
- Teachers can view enrollments for their assigned courses
- Teachers can view terms for their assigned courses or specific term assignments

## Key Functions and Triggers

### Achievement System
- `check_and_award_achievements(UUID)`: Main achievement checking function
- `trigger_check_achievements()`: Trigger function for exercise submissions
- `after_exercise_submission`: Trigger on exercise_submissions table

### Notification System
- `create_feedback_notification()`: Creates notifications for exercise feedback
- `create_award_notification()`: Creates notifications for award achievements
- `mark_notification_as_read(UUID)`: Marks notifications as read
- `get_latest_notifications(UUID, INTEGER)`: Gets latest notifications for user

### Accounting System
- `get_user_balance(UUID)`: Calculates user's account balance
- `handle_course_purchase()`: Handles course purchase transactions

### Utility Functions
- `update_updated_at_column()`: Updates `updated_at` timestamp
- `handle_new_user()`: Creates profile when user signs up

## Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **Profiles**: Users can only access their own profile
- **Exercises**: Trainers/admins can manage all, trainees can view active
- **Exercise Submissions**: Students can view their own, trainers can view all
- **Awards**: Everyone can view awards, students can only see their own achievements
- **Courses**: Varies by role


- **Notifications**: Users can only access their own notifications
- **Accounting**: Admin-only access

- **Teacher Assignments**: Admin management, teacher view of own assignments

## Data Types and Constraints

### Enums
- `notification_type`: 'exercise_feedback', 'award_achieved', 'system'
- `role`: 'trainer', 'trainee', 'admin'
- `difficulty`: 'آسان', 'متوسط', 'سخت'
- `status`: 'active', 'completed', 'draft'
- `rarity`: 'common', 'uncommon', 'rare', 'epic', 'legendary'
- `access_type`: 'all_students', 'course_specific'

### Constraints
- Score values: 0-100
- Completion percentage: 0-100
- Unique constraints on various junction tables
- Check constraints on enum fields

## Migration History

The database has evolved through multiple migrations:

1. **Initial Setup** (20240614-20240622): Basic tables and RLS
2. **Name Field Evolution** (20250616000000-20250616000001): Split name into first_name/last_name
3. **Exercise System Enhancement** (20250616000005): Remove name fields, update achievement system
4. **Course & Accounting** (20250616000006-20250616000018): Add course management and accounting



8. **Teacher Assignment System** (20250615): Add teacher-course and teacher-term assignments
9. **Notifications** (20250705160046): Add notification system

## Current Issues and Notes

1. **Profiles Table Enhanced**: The `profiles` table has been updated with comprehensive user information including `first_name`/`last_name`, personal details, contact information, and preferences
2. **Award System**: Successfully migrated from using `name` and `description` to `code` for awards, with frontend translations
3. **Exercise Submissions**: Removed all name-related fields, now uses only `student_id` for relationships
4. **Course Enrollments**: Removed payment-related fields (`payment_status`, `payment_type`, `amount_paid`) and added `term_id` for course terms
5. **Courses Table**: Uses `name` instead of `title`, includes instructor information and course status
6. **Accounting Table**: Added `payment_type` field with enum constraints
7. **Exercises Table**: Removed `course_name`, `due_date`, and `status` fields; added `days_to_open`, `days_to_close`, `days_to_due`, `form_structure`, and `course_id` fields

## Recommendations

1. **Apply Pending Migrations**: Ensure all migrations are applied to bring schema in sync
2. **Update Database Types**: Regenerate database types after applying migrations
3. **Consistent Naming**: Standardize on either `name` or `first_name`/`last_name` for profiles
4. **Award Codes**: Ensure all award references use `code` instead of `name` 