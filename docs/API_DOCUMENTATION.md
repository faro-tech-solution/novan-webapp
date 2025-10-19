# API Documentation

## 🌐 Overview

The Novan Webapp API is built on Supabase, providing a comprehensive set of endpoints for user management, course management, exercise handling, and more. This documentation covers all available API endpoints, authentication, and data structures.

## 🔐 Authentication

### Supabase Auth

The application uses Supabase Auth for authentication and authorization.

#### Authentication Flow

1. **User Registration**
   ```typescript
   const { data, error } = await supabase.auth.signUp({
     email: 'user@example.com',
     password: 'securepassword',
     options: {
       data: {
         first_name: 'John',
         last_name: 'Doe',
         role: 'trainee'
       }
     }
   });
   ```

2. **User Login**
   ```typescript
   const { data, error } = await supabase.auth.signInWithPassword({
     email: 'user@example.com',
     password: 'securepassword'
   });
   ```

3. **Session Management**
   ```typescript
   // Get current session
   const { data: { session } } = await supabase.auth.getSession();
   
   // Get current user
   const { data: { user } } = await supabase.auth.getUser();
   ```

#### JWT Tokens

- Access tokens are automatically handled by Supabase client
- Tokens are refreshed automatically
- Row Level Security (RLS) policies enforce access control

## 👥 User Management API

### Profiles

#### Get User Profile
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

**Response**:
```json
{
  "id": "uuid",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "role": "trainee",
  "class_id": "class123",
  "class_name": "Advanced Programming",
  "gender": "male",
  "job": "Software Developer",
  "education": "Bachelor's Degree",
  "phone_number": "+1234567890",
  "country": "United States",
  "city": "New York",
  "birthday": "1990-01-01",
  "ai_familiarity": "intermediate",
  "english_level": "advanced",
  "whatsapp_id": "whatsapp123",
  "telegram_id": "telegram123",
  "is_demo": false,
  "language_preference": "en",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### Update User Profile
```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({
    first_name: 'Jane',
    last_name: 'Smith',
    phone_number: '+1987654321'
  })
  .eq('id', userId);
```

#### Get All Users (Admin Only)
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .order('created_at', { ascending: false });
```

## 📚 Course Management API

### Courses

#### Get All Courses
```typescript
const { data, error } = await supabase
  .from('courses')
  .select(`
    *,
    instructor:profiles!courses_instructor_id_fkey(first_name, last_name)
  `)
  .order('created_at', { ascending: false });
```

**Response**:
```json
[
  {
    "id": "uuid",
    "name": "Introduction to React",
    "description": "Learn React fundamentals",
    "instructor_id": "uuid",
    "instructor_name": "John Doe",
    "start_date": "2024-01-01",
    "end_date": "2024-03-01",
    "status": "active",
    "max_students": 50,
    "price": 0,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "instructor": {
      "first_name": "John",
      "last_name": "Doe"
    }
  }
]
```

#### Create Course
```typescript
const { data, error } = await supabase
  .from('courses')
  .insert({
    name: 'Advanced JavaScript',
    description: 'Master JavaScript concepts',
    instructor_id: instructorId,
    instructor_name: 'Jane Smith',
    start_date: '2024-02-01',
    end_date: '2024-04-01',
    max_students: 30,
    price: 99
  })
  .select()
  .single();
```

#### Update Course
```typescript
const { data, error } = await supabase
  .from('courses')
  .update({
    description: 'Updated course description',
    max_students: 40
  })
  .eq('id', courseId)
  .select()
  .single();
```

#### Delete Course
```typescript
const { error } = await supabase
  .from('courses')
  .delete()
  .eq('id', courseId);
```

### Course Terms

#### Get Course Terms
```typescript
const { data, error } = await supabase
  .from('course_terms')
  .select('*')
  .eq('course_id', courseId)
  .order('start_date', { ascending: true });
```

#### Create Course Term
```typescript
const { data, error } = await supabase
  .from('course_terms')
  .insert({
    course_id: courseId,
    name: 'Spring 2024',
    start_date: '2024-01-15',
    end_date: '2024-05-15',
    max_students: 25
  })
  .select()
  .single();
```

### Course Enrollments

#### Get User Enrollments
```typescript
const { data, error } = await supabase
  .from('course_enrollments')
  .select(`
    *,
    course:courses(*),
    term:course_terms(*)
  `)
  .eq('student_id', userId);
```

#### Enroll in Course
```typescript
const { data, error } = await supabase
  .from('course_enrollments')
  .insert({
    course_id: courseId,
    student_id: userId,
    term_id: termId,
    status: 'active'
  })
  .select()
  .single();
```

#### Update Enrollment Status
```typescript
const { data, error } = await supabase
  .from('course_enrollments')
  .update({ status: 'completed' })
  .eq('id', enrollmentId)
  .select()
  .single();
```

## 🏋️ Exercise Management API

### Exercises

#### Get Course Exercises
```typescript
const { data, error } = await supabase
  .from('exercises')
  .select('*')
  .eq('course_id', courseId)
  .order('order_index', { ascending: true });
```

**Response**:
```json
[
  {
    "id": "uuid",
    "title": "React Components Exercise",
    "description": "Create reusable React components",
    "difficulty": "intermediate",
    "points": 100,
    "estimated_time": "2 hours",
    "created_by": "uuid",
    "exercise_type": "form",
    "content_url": null,
    "auto_grade": true,
    "course_id": "uuid",
    "form_structure": {
      "questions": [
        {
          "id": 1,
          "type": "multiple_choice",
          "question": "What is a React component?",
          "options": ["A function", "A class", "Both", "Neither"],
          "correct_answer": 2
        }
      ]
    },
    "days_to_open": 0,
    "days_to_due": 7,
    "days_to_close": 14,
    "order_index": 1,
    "sort_column": "order_index",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### Create Exercise
```typescript
const { data, error } = await supabase
  .from('exercises')
  .insert({
    title: 'JavaScript Functions',
    description: 'Practice function creation',
    difficulty: 'beginner',
    points: 50,
    estimated_time: '1 hour',
    created_by: userId,
    exercise_type: 'form',
    course_id: courseId,
    form_structure: {
      questions: [
        {
          id: 1,
          type: 'text',
          question: 'Write a function that adds two numbers',
          points: 25
        }
      ]
    },
    days_to_open: 0,
    days_to_due: 7,
    order_index: 1
  })
  .select()
  .single();
```

#### Update Exercise
```typescript
const { data, error } = await supabase
  .from('exercises')
  .update({
    title: 'Updated Exercise Title',
    points: 75,
    form_structure: updatedFormStructure
  })
  .eq('id', exerciseId)
  .select()
  .single();
```

#### Reorder Exercises
```typescript
const { error } = await supabase
  .from('exercises')
  .update({ order_index: newOrderIndex })
  .eq('id', exerciseId);
```

### Exercise Submissions

#### Get User Submissions
```typescript
const { data, error } = await supabase
  .from('exercise_submissions')
  .select(`
    *,
    exercise:exercises(*)
  `)
  .eq('student_id', userId)
  .order('submitted_at', { ascending: false });
```

#### Submit Exercise
```typescript
const { data, error } = await supabase
  .from('exercise_submissions')
  .insert({
    exercise_id: exerciseId,
    student_id: userId,
    course_id: courseId,
    solution: 'My solution to the exercise',
    completion_percentage: 100
  })
  .select()
  .single();
```

#### Grade Submission
```typescript
const { data, error } = await supabase
  .from('exercise_submissions')
  .update({
    score: 85,
    feedback: 'Great work! Consider adding error handling.',
    graded_at: new Date().toISOString(),
    graded_by: graderId
  })
  .eq('id', submissionId)
  .select()
  .single();
```

## 🏆 Achievement System API

### Awards

#### Get All Awards
```typescript
const { data, error } = await supabase
  .from('awards')
  .select('*')
  .order('category', { ascending: true });
```

**Response**:
```json
[
  {
    "id": "uuid",
    "code": "first_exercise",
    "icon": "🎯",
    "points_value": 50,
    "rarity": "common",
    "category": "Academic Performance",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### Get User Awards
```typescript
const { data, error } = await supabase
  .from('student_awards')
  .select(`
    *,
    award:awards(*)
  `)
  .eq('student_id', userId)
  .order('earned_at', { ascending: false });
```

## 🔔 Notification API

### Notifications

#### Get User Notifications
```typescript
const { data, error } = await supabase
  .from('notifications')
  .select('*')
  .eq('receiver_id', userId)
  .order('created_at', { ascending: false });
```

**Response**:
```json
[
  {
    "id": "uuid",
    "title": "Exercise Graded",
    "description": "Your exercise has been graded",
    "receiver_id": "uuid",
    "is_read": false,
    "created_at": "2024-01-01T00:00:00Z",
    "read_at": null,
    "link": "/exercises/123",
    "type": "exercise_feedback",
    "metadata": {},
    "sender_id": "uuid",
    "priority": "normal",
    "expires_at": null,
    "icon": "📝"
  }
]
```

#### Mark Notification as Read
```typescript
const { data, error } = await supabase
  .from('notifications')
  .update({
    is_read: true,
    read_at: new Date().toISOString()
  })
  .eq('id', notificationId)
  .select()
  .single();
```

#### Create Notification
```typescript
const { data, error } = await supabase
  .from('notifications')
  .insert({
    title: 'New Exercise Available',
    description: 'A new exercise has been added to your course',
    receiver_id: userId,
    type: 'system',
    priority: 'normal',
    icon: '📚'
  })
  .select()
  .single();
```

## 💰 Financial Management API

### Accounting

#### Get User Balance
```typescript
const { data, error } = await supabase
  .from('accounting')
  .select('*')
  .eq('user_id', userId)
  .order('transaction_date', { ascending: false });
```

#### Record Transaction
```typescript
const { data, error } = await supabase
  .from('accounting')
  .insert({
    user_id: userId,
    course_id: courseId,
    amount: -99,
    description: 'Course purchase: Advanced JavaScript',
    payment_method: 'credit_card',
    payment_status: 'completed',
    payment_type: 'buy_course'
  })
  .select()
  .single();
```

## 👨‍🏫 Teacher Assignment API

### Course Assignments

#### Get Teacher Assignments
```typescript
const { data, error } = await supabase
  .from('teacher_course_assignments')
  .select(`
    *,
    course:courses(*)
  `)
  .eq('teacher_id', teacherId);
```

#### Assign Teacher to Course
```typescript
const { data, error } = await supabase
  .from('teacher_course_assignments')
  .insert({
    teacher_id: teacherId,
    course_id: courseId,
    assigned_by: adminId
  })
  .select()
  .single();
```

## 🔍 Query Examples

### Complex Queries

#### Get Course with Enrollments and Exercises
```typescript
const { data, error } = await supabase
  .from('courses')
  .select(`
    *,
    enrollments:course_enrollments(
      *,
      student:profiles(first_name, last_name, email)
    ),
    exercises:exercises(
      *,
      submissions:exercise_submissions(
        *,
        student:profiles(first_name, last_name)
      )
    )
  `)
  .eq('id', courseId)
  .single();
```

#### Get User Dashboard Data
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select(`
    *,
    enrollments:course_enrollments(
      *,
      course:courses(*),
      term:course_terms(*)
    ),
    submissions:exercise_submissions(
      *,
      exercise:exercises(*)
    ),
    awards:student_awards(
      *,
      award:awards(*)
    )
  `)
  .eq('id', userId)
  .single();
```

## 📊 Real-time Subscriptions

### Subscribe to Changes

#### Exercise Updates
```typescript
const subscription = supabase
  .channel('exercise-updates')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'exercises',
      filter: `course_id=eq.${courseId}`
    },
    (payload) => {
      console.log('Exercise updated:', payload);
    }
  )
  .subscribe();
```

#### Notification Updates
```typescript
const subscription = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `receiver_id=eq.${userId}`
    },
    (payload) => {
      console.log('New notification:', payload);
    }
  )
  .subscribe();
```

## 🚨 Error Handling

### Error Response Format
```json
{
  "error": {
    "message": "Error description",
    "details": "Additional error details",
    "hint": "Helpful hint for resolution",
    "code": "ERROR_CODE"
  }
}
```

### Common Error Codes
- `PGRST116`: Row not found
- `PGRST301`: Invalid request
- `PGRST302`: Invalid request body
- `PGRST303`: Invalid request headers
- `PGRST304`: Invalid request method

### Error Handling Best Practices
```typescript
try {
  const { data, error } = await supabase
    .from('table')
    .select('*');
    
  if (error) {
    console.error('Database error:', error);
    throw new Error(error.message);
  }
  
  return data;
} catch (error) {
  console.error('Operation failed:', error);
  throw error;
}
```

## 🔒 Security Considerations

### Row Level Security (RLS)
- All tables have RLS enabled
- Policies enforce user-specific access
- Admin users have broader access
- Sensitive operations require proper authentication

### Data Validation
- Input validation with Zod schemas
- SQL injection protection via parameterized queries
- XSS prevention through proper escaping
- CSRF protection via JWT tokens

## 📈 Performance Optimization

### Query Optimization
- Use specific column selection instead of `*`
- Implement proper indexing
- Use pagination for large datasets
- Leverage database functions for complex operations

### Caching Strategy
- React Query for client-side caching
- Database query result caching
- Static asset caching
- API response caching

This API documentation provides comprehensive coverage of all available endpoints and usage patterns for the Novan Webapp. Follow these guidelines to integrate with the system effectively and securely.


