# Exercise Q&A System Implementation Plan

## 1️⃣ Overall Architecture

### Question and Answer Structure
- **Main Question**: `parent_id = NULL`, has both `title` and `description`
- **Answer to Question**: `parent_id = main question`, only `description`
- **Reply to Answer**: `parent_id = previous answer`, only `description`

### Roles and Permissions

#### Students
- ✅ View Q&A for enrolled courses
- ✅ Ask questions and provide answers in enrolled courses
- ✅ Vote (upvote/downvote) and retract votes
- ✅ View total vote count only (not individual votes)
- ✅ Edit/delete own questions and answers
- ✅ Bookmark questions/answers

#### Instructors
- ✅ View Q&A for their courses
- ✅ Answer questions in their courses
- ✅ Vote and retract votes
- ✅ View total vote count only (not individual votes)
- ✅ Edit/delete own messages
- ✅ Bookmark questions/answers

#### Admin
- ✅ View Q&A for all courses
- ✅ Ask questions and provide answers in all courses
- ✅ Vote and retract votes
- ✅ View individual votes (all votes)
- ✅ Delete any question/answer
- ✅ Bookmark questions/answers

### Notifications
1. **New Question** → Notification sent to course instructor
2. **Reply to Question/Answer** → Notification sent to parent post author (if different user)

---

## 2️⃣ Database Schema

### Main Table `exercise_qa`
```sql
CREATE TABLE IF NOT EXISTS exercise_qa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT, -- for main questions, null for answers
  description TEXT NOT NULL,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES exercise_qa(id) ON DELETE CASCADE, -- for answers and replies
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exercise_qa_exercise_id ON exercise_qa(exercise_id);
CREATE INDEX idx_exercise_qa_parent_id ON exercise_qa(parent_id);
CREATE INDEX idx_exercise_qa_user_id ON exercise_qa(user_id);
```

### Votes Table `exercise_qa_vote`
```sql
CREATE TABLE IF NOT EXISTS exercise_qa_vote (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_qa_id UUID NOT NULL REFERENCES exercise_qa(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type SMALLINT NOT NULL CHECK (vote_type IN (1, -1)), -- 1 for upvote, -1 for downvote
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(exercise_qa_id, user_id) -- each user can only vote once per post
);

CREATE INDEX idx_exercise_qa_vote_qa_id ON exercise_qa_vote(exercise_qa_id);
CREATE INDEX idx_exercise_qa_vote_user_id ON exercise_qa_vote(user_id);
```

### Bookmarks Table `exercise_qa_bookmark`
```sql
CREATE TABLE IF NOT EXISTS exercise_qa_bookmark (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qa_id UUID NOT NULL REFERENCES exercise_qa(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(qa_id, user_id) -- each user can only bookmark a post once
);

CREATE INDEX idx_exercise_qa_bookmark_qa_id ON exercise_qa_bookmark(qa_id);
CREATE INDEX idx_exercise_qa_bookmark_user_id ON exercise_qa_bookmark(user_id);
```

---

## 3️⃣ Row Level Security (RLS) Policies

### Table `exercise_qa`

#### View (SELECT)
```sql
-- Students: only enrolled courses
CREATE POLICY "Enrolled students can view course Q&A" ON exercise_qa
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM course_enrollments ce
      JOIN exercises e ON e.course_id = ce.course_id
      WHERE e.id = exercise_qa.exercise_id
        AND ce.student_id = auth.uid()
        AND ce.status = 'active'
    )
  );

-- Instructors: only their courses
CREATE POLICY "Instructors can view their course Q&A" ON exercise_qa
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM exercises e
      JOIN courses c ON c.id = e.course_id
      WHERE e.id = exercise_qa.exercise_id
        AND c.instructor_id = auth.uid()
    )
  );

-- Admin: all Q&A
CREATE POLICY "Admins can view all Q&A" ON exercise_qa
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );
```

#### Create (INSERT)
```sql
-- Students: only in enrolled courses
CREATE POLICY "Enrolled students can create Q&A" ON exercise_qa
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM course_enrollments ce
      JOIN exercises e ON e.course_id = ce.course_id
      WHERE e.id = exercise_qa.exercise_id
        AND ce.student_id = auth.uid()
        AND ce.status = 'active'
    )
  );

-- Instructors: only in their courses
CREATE POLICY "Instructors can create Q&A in their courses" ON exercise_qa
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM exercises e
      JOIN courses c ON c.id = e.course_id
      WHERE e.id = exercise_qa.exercise_id
        AND c.instructor_id = auth.uid()
    )
  );

-- Admin: in all courses
CREATE POLICY "Admins can create Q&A anywhere" ON exercise_qa
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );
```

#### Edit (UPDATE)
```sql
-- All: only own posts
CREATE POLICY "Users can update own Q&A" ON exercise_qa
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### Delete (DELETE)
```sql
-- All: only own posts
CREATE POLICY "Users can delete own Q&A" ON exercise_qa
  FOR DELETE USING (auth.uid() = user_id);

-- Admin: all posts
CREATE POLICY "Admins can delete any Q&A" ON exercise_qa
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );
```

---

### Table `exercise_qa_vote`

#### View (SELECT)
```sql
-- All: only own votes
CREATE POLICY "Users can view own votes" ON exercise_qa_vote
  FOR SELECT USING (auth.uid() = user_id);

-- Admin: all votes
CREATE POLICY "Admins can view all votes" ON exercise_qa_vote
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );
```

#### Vote (INSERT)
```sql
-- Students: only in enrolled courses
CREATE POLICY "Enrolled students can vote" ON exercise_qa_vote
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM exercise_qa qa
      JOIN exercises e ON e.id = qa.exercise_id
      JOIN course_enrollments ce ON ce.course_id = e.course_id
      WHERE qa.id = exercise_qa_vote.exercise_qa_id
        AND ce.student_id = auth.uid()
        AND ce.status = 'active'
    )
  );

-- Instructors: only in their courses
CREATE POLICY "Instructors can vote in their courses" ON exercise_qa_vote
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM exercise_qa qa
      JOIN exercises e ON e.id = qa.exercise_id
      JOIN courses c ON c.id = e.course_id
      WHERE qa.id = exercise_qa_vote.exercise_qa_id
        AND c.instructor_id = auth.uid()
    )
  );

-- Admin: in all courses
CREATE POLICY "Admins can vote anywhere" ON exercise_qa_vote
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );
```

#### Retract Vote (DELETE)
```sql
-- All: only own vote
CREATE POLICY "Users can delete own vote" ON exercise_qa_vote
  FOR DELETE USING (auth.uid() = user_id);
```

---

### Table `exercise_qa_bookmark`

#### View (SELECT)
```sql
-- All: only own bookmarks
CREATE POLICY "Users can view own bookmarks" ON exercise_qa_bookmark
  FOR SELECT USING (auth.uid() = user_id);
```

#### Add (INSERT)
```sql
-- Students: only in enrolled courses
CREATE POLICY "Enrolled students can bookmark" ON exercise_qa_bookmark
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM exercise_qa qa
      JOIN exercises e ON e.id = qa.exercise_id
      JOIN course_enrollments ce ON ce.course_id = e.course_id
      WHERE qa.id = exercise_qa_bookmark.qa_id
        AND ce.student_id = auth.uid()
        AND ce.status = 'active'
    )
  );

-- Instructors: only in their courses
CREATE POLICY "Instructors can bookmark in their courses" ON exercise_qa_bookmark
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM exercise_qa qa
      JOIN exercises e ON e.id = qa.exercise_id
      JOIN courses c ON c.id = e.course_id
      WHERE qa.id = exercise_qa_bookmark.qa_id
        AND c.instructor_id = auth.uid()
    )
  );

-- Admin: in all courses
CREATE POLICY "Admins can bookmark anywhere" ON exercise_qa_bookmark
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );
```

#### Delete (DELETE)
```sql
-- All: only own bookmarks
CREATE POLICY "Users can delete own bookmarks" ON exercise_qa_bookmark
  FOR DELETE USING (auth.uid() = user_id);
```

---

## 4️⃣ Functions & Triggers

### Calculate Vote Count
```sql
CREATE OR REPLACE FUNCTION update_qa_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE exercise_qa
    SET vote_count = vote_count + NEW.vote_type
    WHERE id = NEW.exercise_qa_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE exercise_qa
    SET vote_count = vote_count - OLD.vote_type
    WHERE id = OLD.exercise_qa_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE exercise_qa
    SET vote_count = vote_count - OLD.vote_type + NEW.vote_type
    WHERE id = NEW.exercise_qa_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_qa_vote_count
AFTER INSERT OR UPDATE OR DELETE ON exercise_qa_vote
FOR EACH ROW EXECUTE FUNCTION update_qa_vote_count();
```

### Update `updated_at`
```sql
CREATE TRIGGER set_updated_at_qa
BEFORE UPDATE ON exercise_qa
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### New Question Notification (to Instructor)
```sql
CREATE OR REPLACE FUNCTION notify_trainer_new_question()
RETURNS TRIGGER AS $$
DECLARE
  trainer_id UUID;
  course_id_var UUID;
  exercise_title TEXT;
BEGIN
  -- Only for main questions (not answers)
  IF NEW.parent_id IS NULL THEN
    -- Find instructor and exercise title
    SELECT c.instructor_id, c.id, e.title 
    INTO trainer_id, course_id_var, exercise_title
    FROM exercises e
    JOIN courses c ON c.id = e.course_id
    WHERE e.id = NEW.exercise_id;
    
    -- Create notification
    INSERT INTO notifications (
      title, 
      description, 
      receiver_id, 
      type, 
      course_id, 
      sender_id, 
      metadata
    ) VALUES (
      'New Question in Exercise',
      'A new question was posted in exercise "' || exercise_title || '"',
      trainer_id,
      'system',
      course_id_var,
      NEW.user_id,
      jsonb_build_object(
        'exercise_id', NEW.exercise_id,
        'qa_id', NEW.id,
        'link', '/exercise/' || NEW.exercise_id || '/qa/' || NEW.id,
        'qa_type', 'question'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_trainer_new_question
AFTER INSERT ON exercise_qa
FOR EACH ROW EXECUTE FUNCTION notify_trainer_new_question();
```

### Answer Notification (to Parent Author)
```sql
CREATE OR REPLACE FUNCTION notify_answer_to_question()
RETURNS TRIGGER AS $$
DECLARE
  parent_user_id UUID;
  parent_qa_record RECORD;
  course_id_var UUID;
  exercise_title TEXT;
BEGIN
  -- Only for answers (not main questions)
  IF NEW.parent_id IS NOT NULL THEN
    -- Find parent author
    SELECT user_id, exercise_id 
    INTO parent_qa_record
    FROM exercise_qa
    WHERE id = NEW.parent_id;
    
    -- Only if answer author is different from parent author
    IF parent_qa_record.user_id != NEW.user_id THEN
      -- Find exercise information
      SELECT e.title, e.course_id 
      INTO exercise_title, course_id_var
      FROM exercises e
      WHERE e.id = parent_qa_record.exercise_id;
      
      -- Create notification
      INSERT INTO notifications (
        title, 
        description, 
        receiver_id, 
        type, 
        course_id, 
        sender_id, 
        metadata
      ) VALUES (
        'New Reply',
        'Someone replied to your question/answer in exercise "' || exercise_title || '"',
        parent_qa_record.user_id,
        'system',
        course_id_var,
        NEW.user_id,
        jsonb_build_object(
          'exercise_id', parent_qa_record.exercise_id,
          'qa_id', NEW.parent_id,
          'reply_id', NEW.id,
          'link', '/exercise/' || parent_qa_record.exercise_id || '/qa/' || NEW.parent_id,
          'qa_type', 'answer'
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_answer_to_question
AFTER INSERT ON exercise_qa
FOR EACH ROW EXECUTE FUNCTION notify_answer_to_question();
```

---

## 5️⃣ TypeScript Types

```typescript
// src/types/qa.ts
import { SubmissionStudent } from './student';

// ========================================
// BASE INTERFACES (matching database)
// ========================================

export interface ExerciseQA {
  id: string;
  title: string | null;
  description: string;
  exercise_id: string;
  user_id: string;
  parent_id: string | null;
  vote_count: number;
  created_at: string;
  updated_at: string;
}

export interface ExerciseQAVote {
  id: string;
  exercise_qa_id: string;
  user_id: string;
  vote_type: 1 | -1;
  created_at: string;
}

export interface ExerciseQABookmark {
  id: string;
  qa_id: string;
  user_id: string;
  created_at: string;
}

// ========================================
// INTERFACES WITH JOINS (for API fetch)
// ========================================

// Simple level: only with user information
export interface ExerciseQAWithUser extends ExerciseQA {
  profiles: SubmissionStudent | null;
}

// Full level: with all joins
export interface ExerciseQAWithDetails extends ExerciseQA {
  // User information (with role)
  profiles: (SubmissionStudent & { role: string }) | null;
  
  // Current user's vote
  exercise_qa_vote: {
    vote_type: 1 | -1;
  }[] | null;
  
  // Bookmark status
  exercise_qa_bookmark: {
    id: string;
  }[] | null;
  
  // Nested replies
  replies?: ExerciseQAWithDetails[];
}

// ========================================
// HELPER TYPES (for easier usage)
// ========================================

export type UserVoteType = 1 | -1 | null;
export type BookmarkStatus = boolean;

// ========================================
// REQUEST/RESPONSE TYPES
// ========================================

export interface CreateQAData {
  title?: string | null;
  description: string;
  exercise_id: string;
  parent_id?: string | null;
}

export interface UpdateQAData {
  title?: string | null;
  description?: string;
}

export interface VoteData {
  exercise_qa_id: string;
  vote_type: 1 | -1;
}

export interface BookmarkData {
  qa_id: string;
}
```

### Helper Functions
```typescript
// src/utils/qa-helpers.ts

import { ExerciseQAWithDetails, UserVoteType } from '@/types/qa';

// Extract user vote
export function getUserVote(qa: ExerciseQAWithDetails): UserVoteType {
  if (!qa.exercise_qa_vote || qa.exercise_qa_vote.length === 0) {
    return null;
  }
  return qa.exercise_qa_vote[0].vote_type;
}

// Check bookmark status
export function isBookmarked(qa: ExerciseQAWithDetails): boolean {
  return !!qa.exercise_qa_bookmark && qa.exercise_qa_bookmark.length > 0;
}

// Build user full name
export function getUserFullName(qa: ExerciseQAWithDetails): string {
  if (!qa.profiles) return 'Unknown User';
  return `${qa.profiles.first_name} ${qa.profiles.last_name}`.trim();
}

// Convert flat list to tree (questions and answers)
export function buildQATree(qaList: ExerciseQAWithDetails[]): ExerciseQAWithDetails[] {
  const map = new Map<string, ExerciseQAWithDetails>();
  const roots: ExerciseQAWithDetails[] = [];

  // Build map
  qaList.forEach(qa => {
    map.set(qa.id, { ...qa, replies: [] });
  });

  // Build tree
  qaList.forEach(qa => {
    const node = map.get(qa.id)!;
    if (qa.parent_id) {
      const parent = map.get(qa.parent_id);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}
```

---

## 6️⃣ Implementation Steps

### Step 1: Database Setup
1. Run migration to create tables
2. Enable RLS
3. Add policies
4. Create functions and triggers

### Step 2: Types & Services
1. Create `src/types/qa.ts`
2. Create `src/utils/qa-helpers.ts`
3. Create `src/services/qaService.ts` (CRUD operations)
4. Create `src/hooks/useExerciseQA.ts` (React Query hooks)

### Step 3: UI Components
1. `QAList.tsx` - Questions list
2. `QAItem.tsx` - Display single question/answer
3. `QAForm.tsx` - Question form
4. `VoteButtons.tsx` - Vote buttons
5. `BookmarkButton.tsx` - Bookmark button

### Step 4: Integration
1. Add Q&A section to exercise page
2. Test notifications
3. Test RLS policies with different roles

---

## 7️⃣ Important Notes

### Security
- ✅ All tables have RLS enabled
- ✅ No API endpoints needed (Supabase direct)
- ✅ Access controlled at database level

### Performance
- ✅ Indexes on foreign keys
- ✅ Efficient triggers for vote_count
- ✅ Query optimization with limited select

### UX
- ✅ Real-time updates (Supabase subscription)
- ✅ Optimistic UI updates
- ✅ Loading states
- ✅ Error handling

