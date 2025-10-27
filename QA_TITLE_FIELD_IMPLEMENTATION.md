# Q&A Title Field Implementation Summary

## Overview
Added an optional title field to Q&A questions in the exercise system. Main questions require a title, while replies/answers can be created without titles.

## Changes Made

### 1. Database Migration
- **File**: `migrations/add_title_to_exercise_questions.sql`
- **Changes**: 
  - Added `title` column to `exercise_questions` table as optional (nullable)
  - Updated existing main questions (parent_id IS NULL) with content-based titles
  - Replies (parent_id IS NOT NULL) remain without titles

### 2. TypeScript Types
- **File**: `src/types/exerciseQA.ts`
- **Changes**:
  - Added `title: string | null` field to `ExerciseQuestion` interface
  - Added `title?: string | null` field to `CreateQuestionData` interface

### 3. Service Layer
- **File**: `src/services/exerciseQAService.ts`
- **Changes**: 
  - Service handles optional title field through updated `CreateQuestionData` interface
  - Reply creation doesn't include title field (replies have null titles)

### 4. UI Components
- **File**: `src/components/exercises/tabs/QATab.tsx`
- **Changes**:
  - Added title input field to main question creation dialog
  - Title is required for main questions only
  - Replies are created without title input field
  - Conditional title display (only shows if title exists)
  - Form validation requires title for main questions only

### 5. Migration Script
- **File**: `scripts/apply_title_field_migration.sh`
- **Purpose**: Executable script to apply the database migration

## Features

### Main Question Creation
- Users must provide both a title and content when creating main questions
- Title field has a 200 character limit
- Form validation prevents submission without both fields

### Reply Creation
- Users only need to provide content when creating replies
- No title field is shown or required for replies
- Replies are created with null title values

### Question Display
- Main questions show the title prominently above the content (if title exists)
- Replies display only the content without titles
- Maintains existing functionality for voting, etc.

### Backward Compatibility
- Existing main questions are automatically updated with content-based titles
- Existing replies remain unchanged (no titles)
- No data loss or breaking changes for existing functionality

## Usage

### Applying the Migration
```bash
./scripts/apply_title_field_migration.sh
```

### Creating Main Questions
1. Click "سوال بپرسید" (Ask Question) button
2. Fill in the title field (required)
3. Fill in the content field (required)
4. Submit the question

### Creating Replies
1. Click "پاسخ" (Reply) button on any question
2. Fill in the content field (title not required)
3. Submit the reply

## Technical Details

### Database Schema
```sql
ALTER TABLE public.exercise_questions 
ADD COLUMN title TEXT;

-- Update existing main questions only
UPDATE public.exercise_questions 
SET title = CASE 
  WHEN LENGTH(content) > 50 THEN LEFT(content, 47) || '...'
  ELSE content
END
WHERE parent_id IS NULL AND title IS NULL;
```

### Form Validation
- **Main Questions**: Title required, max 200 characters; Content required
- **Replies**: Content required only (no title field)

### Data Structure
- **Main Questions** (parent_id = null): Can have titles
- **Replies** (parent_id = question_id): Typically have null titles

## Testing Recommendations
1. Test main question creation with and without title
2. Test reply creation (should not require title)
3. Verify existing questions display properly with auto-generated titles
4. Verify existing replies display without titles
5. Test form validation prevents submission with empty title for main questions
6. Test that replies and voting still work correctly
7. Verify title display is conditional (only shows when title exists)
