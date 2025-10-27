# Database Schema Documentation

## Overview

The Novan Webapp database is built on PostgreSQL with Supabase, featuring a comprehensive schema designed for learning management, user management, and gamified education experiences.

## Core Tables

### 1. User Management

#### `profiles` Table
Stores comprehensive user profile information linked to Supabase Auth users.

```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email text,
  role text DEFAULT 'trainee' CHECK (role IN ('trainer', 'trainee', 'admin')),
  class_id text,
  class_name text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  gender text,
  job text,
  education text,
  phone_number text,
  country text,
  city text,
  birthday date,
  ai_familiarity text CHECK (ai_familiarity IN ('beginner', 'intermediate', 'advanced', 'expert')),
  english_level text CHECK (english_level IN ('beginner', 'intermediate', 'advanced', 'native')),
  whatsapp_id text,
  telegram_id text,
  is_demo boolean NOT NULL DEFAULT false,
  language_preference TEXT DEFAULT 'fa',
  PRIMARY KEY (id)
);
```

**Indexes**: `idx_profiles_email`, `idx_profiles_role`

**RLS Policies**:
- Users can view and update their own profile
- Admins can view all profiles

### 2. Course Management

#### `courses` Table
Stores course information and metadata.

```sql
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
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

**Indexes**: `idx_courses_instructor_id`, `idx_courses_status`

#### `course_terms` Table
Manages different terms/sessions for courses.

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

**Indexes**: `idx_course_terms_course_id`

#### `course_enrollments` Table
Tracks student enrollments in courses.

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

**Indexes**: `idx_course_enrollments_course_id`, `idx_course_enrollments_student_id`, `idx_course_enrollments_term_id`

### 3. Exercise System

#### `exercises` Table
Stores exercise definitions and metadata.

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
  exercise_type TEXT DEFAULT 'form' CHECK (exercise_type IN ('form', 'video', 'audio', 'simple', 'iframe')),
  content_url TEXT,
  auto_grade BOOLEAN DEFAULT FALSE,
  course_id UUID NOT NULL REFERENCES courses(id),
  form_structure JSONB DEFAULT '{"questions": []}',
  days_to_open INTEGER DEFAULT 0,
  days_to_due INTEGER DEFAULT 7,
  days_to_close INTEGER,
  order_index INTEGER DEFAULT 0,
  sort_column TEXT DEFAULT 'order_index'
);
```

**Indexes**: `idx_exercises_course_id`, `idx_exercises_type`, `idx_exercises_order_index`

#### `exercise_submissions` Table
Stores student submissions for exercises.

```sql
CREATE TABLE public.exercise_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) NOT NULL,
  course_id UUID REFERENCES public.courses(id),
  solution TEXT NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by UUID REFERENCES auth.users(id),
  auto_graded BOOLEAN DEFAULT FALSE,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  UNIQUE(exercise_id, student_id)
);
```

**Indexes**: `idx_exercise_submissions_exercise_id`, `idx_exercise_submissions_student_id`

### 4. Achievement System

#### `awards` Table
Defines available awards/achievements.

```sql
CREATE TABLE public.awards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  points_value INTEGER NOT NULL DEFAULT 0,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

**Indexes**: `idx_awards_code`, `idx_awards_category`

#### `student_awards` Table
Tracks which awards students have earned.

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

**Indexes**: `idx_student_awards_student_id`, `idx_student_awards_award_id`

### 5. Notification System

#### `notifications` Table
Stores user notifications.

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
  type notification_type NOT NULL,
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

**Indexes**: `idx_notifications_receiver_id`, `idx_notifications_created_at`, `idx_notifications_is_read`

### 6. Financial Management

#### `accounting` Table
Tracks financial transactions.

```sql
CREATE TABLE accounting (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
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

**Indexes**: `idx_accounting_user_id`, `idx_accounting_course_id`, `idx_accounting_transaction_date`

### 7. Product Management System

#### `products` Table
Stores downloadable/viewable products with access control and pricing.

```sql
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  thumbnail TEXT,
  product_type TEXT NOT NULL DEFAULT 'other' CHECK (product_type IN ('video', 'audio', 'ebook', 'other')),
  file_url TEXT,
  author TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  duration INTEGER, -- Duration in seconds for video/audio
  file_size BIGINT, -- File size in bytes
  price INTEGER DEFAULT 0, -- Price in cents (0 = free)
  access_level TEXT NOT NULL DEFAULT 'public' CHECK (access_level IN ('public', 'registered', 'paid')),
  is_featured BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes**: `idx_products_slug`, `idx_products_category`, `idx_products_status`, `idx_products_is_featured`, `idx_products_access_level`, `idx_products_product_type`, `idx_products_created_by`

**RLS Policies**:
- Public read access to active products
- Authenticated users can read registered/paid products
- Admin-only write access

**Functions**:
- `generate_slug(input_title TEXT)`: Auto-generates unique slugs
- `auto_generate_slug()`: Trigger function for slug generation

### 8. Teacher Assignment System

#### `teacher_course_assignments` Table
Manages teacher assignments to courses.

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
Manages teacher assignments to specific course terms.

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

## Data Types and Constraints

### Enums
- `notification_type`: 'exercise_feedback', 'award_achieved', 'system'
- `role`: 'trainer', 'trainee', 'admin'
- `difficulty`: 'آسان', 'متوسط', 'سخت'
- `status`: 'active', 'completed', 'draft'
- `rarity`: 'common', 'uncommon', 'rare', 'epic', 'legendary'
- `product_type`: 'video', 'audio', 'ebook', 'other'
- `access_level`: 'public', 'registered', 'paid'

### Constraints
- Score values: 0-100
- Completion percentage: 0-100
- Unique constraints on various junction tables
- Check constraints on enum fields

## Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **Profiles**: Users can only access their own profile
- **Exercises**: Trainers/admins can manage all, trainees can view active
- **Exercise Submissions**: Students can view their own, trainers can view all
- **Awards**: Everyone can view awards, students can only see their own achievements
- **Courses**: Varies by role and assignment
- **Notifications**: Users can only access their own notifications
- **Accounting**: Admin-only access
- **Products**: Public read for active products, authenticated read for registered/paid, admin-only write
- **Teacher Assignments**: Admin management, teacher view of own assignments

## Key Functions

### Achievement System
- `check_and_award_achievements(UUID)`: Main achievement checking function
- `trigger_check_achievements()`: Trigger function for exercise submissions

### Notification System
- `create_feedback_notification()`: Creates notifications for exercise feedback
- `create_award_notification()`: Creates notifications for award achievements
- `mark_notification_as_read(UUID)`: Marks notifications as read

### User Management
- `handle_new_user()`: Creates profile when user signs up
- `get_current_user_role()`: Gets current user's role

### Utility Functions
- `update_updated_at_column()`: Updates `updated_at` timestamp

## Triggers

- `on_auth_user_created`: Automatically creates profile when user signs up
- `after_exercise_submission`: Triggers achievement checking
- `update_updated_at`: Automatically updates `updated_at` timestamps

## Performance Optimization

### Indexes
- Primary keys on all tables
- Foreign key indexes for join performance
- Composite indexes for common query patterns
- Partial indexes for filtered queries

### Query Optimization
- Efficient join strategies
- Proper use of indexes
- Optimized data types
- Regular maintenance and statistics updates

This schema provides a robust foundation for the learning management system with proper security, performance, and scalability considerations.


