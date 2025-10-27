# Exercise Q&A System

## Overview

A threaded discussion system for exercises enabling students to ask questions, instructors to provide answers, and community voting/bookmarking for helpful content. The system uses a single hierarchical table structure for questions, answers, and replies.

## Features

### For Students
- Ask questions with title and description in enrolled courses
- Answer questions and reply to existing answers
- Upvote/downvote content with vote retraction capability
- Bookmark important questions and answers
- Edit and delete own posts
- View total vote counts (not individual votes)

### For Instructors
- View Q&A in assigned courses
- Answer student questions and participate in discussions
- Receive notifications when new questions are posted
- Vote and bookmark content
- Edit and delete own posts

### For Admins
- Full access to all Q&A across all courses
- Delete any content for moderation
- View individual vote details (not just totals)
- Complete system management

## Database Structure

### Tables

**exercise_qa**
- Stores questions, answers, and replies in single hierarchical table
- Main questions have title field, answers/replies only have description
- Parent-child relationships via parent_id (NULL for root questions)
- Vote count automatically calculated via triggers
- Foreign keys to exercises and profiles tables

**exercise_qa_vote**
- Tracks user votes (upvote +1, downvote -1)
- One vote per user per post (unique constraint)
- Automatically updates vote_count in exercise_qa

**exercise_qa_bookmark**
- Manages user bookmarks
- One bookmark per user per post (unique constraint)
- Simple add/remove functionality

### Indexes
- Foreign keys on exercise_id, user_id, parent_id
- Optimized for common query patterns

## Security (RLS Policies)

### Access Control by Role

**Students**
- Can only view and interact with Q&A in courses with active enrollment
- Cannot access Q&A from non-enrolled courses
- Can only edit/delete own posts

**Instructors**
- Access limited to courses they are assigned to (via instructor_id in courses table)
- Cannot access other instructors' course Q&A
- Can only edit/delete own posts

**Admins**
- Unrestricted access to all Q&A across all courses
- Can delete any post for moderation
- Can view all vote details

### Data Privacy
- Users can only see their own votes and bookmarks
- Vote counts are public but individual voter identities are private (except admins)
- Post authors always visible for transparency

## Key Features

**Threaded Discussions**
Questions can have answers, answers can have replies, creating nested conversation threads

**Automatic Vote Counting**
Database triggers automatically calculate and update vote totals when users vote, change votes, or retract votes

**Automated Notifications**
- Instructor receives notification when student posts new question
- Post author receives notification when someone replies (except self-replies)
- Notifications include direct links to Q&A threads

**Hierarchical Structure**
Single table stores all content using parent_id relationships, simplifying queries and maintaining data consistency

## Implementation Steps

### Phase 1: Database Setup
1. Create migration file with three tables (exercise_qa, exercise_qa_vote, exercise_qa_bookmark)
2. Add indexes on all foreign keys for performance
3. Enable Row Level Security on all three tables
4. Create RLS policies for each role (Student, Instructor, Admin) for each operation (SELECT, INSERT, UPDATE, DELETE)
5. Create database function for automatic vote count calculation
6. Create database function for new question notifications to instructor
7. Create database function for answer/reply notifications to parent author
8. Create triggers to execute functions on data changes
9. Create trigger for automatic updated_at timestamp updates
10. Test migration on development database
11. Verify all policies work correctly with different user roles

### Phase 2: TypeScript Types
1. Create base interfaces matching database tables (ExerciseQA, ExerciseQAVote, ExerciseQABookmark)
2. Create interfaces for joined data (ExerciseQAWithUser, ExerciseQAWithDetails)
3. Extend SubmissionStudent interface for user data consistency
4. Create request/response types (CreateQAData, UpdateQAData, VoteData, BookmarkData)
5. Export all types from central types file

### Phase 3: Helper Functions
1. Create utility function to extract user vote from Q&A data
2. Create utility function to check bookmark status
3. Create utility function to build user full name from profile
4. Create utility function to convert flat list to tree structure for nested display
5. Add TypeScript documentation for all helper functions

### Phase 4: Service Layer
1. Create Q&A service with CRUD operations for questions/answers
2. Implement vote service methods (add vote, change vote, retract vote)
3. Implement bookmark service methods (add bookmark, remove bookmark)
4. Add error handling and validation to all service methods
5. Create service for fetching Q&A with user vote and bookmark status

### Phase 5: React Query Hooks
1. Create hook for fetching Q&A list for an exercise
2. Create hook for creating new question
3. Create hook for creating answer/reply
4. Create hook for updating post
5. Create hook for deleting post
6. Create hook for voting operations
7. Create hook for bookmark operations
8. Implement optimistic updates for better UX
9. Add proper cache invalidation and refetching

### Phase 6: UI Components
1. Create QAList component to display all questions
2. Create QAItem component for individual question/answer display
3. Create QAForm component for creating/editing questions and answers
4. Create VoteButtons component with upvote/downvote functionality
5. Create BookmarkButton component
6. Add loading states and error handling to all components
7. Implement responsive design for mobile and desktop
8. Add proper RTL support for Persian language

### Phase 7: Integration
1. Add Q&A section to exercise page layout
2. Connect components with React Query hooks
3. Implement real-time updates using Supabase subscriptions
4. Test notifications are being created correctly
5. Test with different user roles (Student, Instructor, Admin)
6. Verify RLS policies work as expected
7. Test vote counting and bookmark functionality
8. Verify threaded discussion display
9. Test edit and delete operations

### Phase 8: Testing and Refinement
1. Test enrollment-based access control
2. Test instructor course assignment access
3. Test admin full access
4. Verify notifications are sent correctly
5. Test vote count accuracy
6. Test bookmark persistence
7. Verify nested reply structure
8. Test with large datasets
9. Optimize database queries if needed
10. Fix any identified bugs or issues

## Migration Instructions

### Applying Database Changes
1. Create migration file in migrations directory
2. Run migration on development database first
3. Verify tables created with correct structure
4. Verify indexes exist on foreign keys
5. Verify RLS is enabled on all tables
6. Verify all policies created correctly
7. Verify functions and triggers are active
8. Test basic operations (insert, select, update, delete)
9. Test with different user roles
10. Apply to staging environment
11. Test in staging
12. Apply to production

### Verification Checklist
- All three tables exist with correct columns
- Indexes created on foreign keys
- RLS enabled on all tables
- All policies created for all roles
- Functions created without errors
- Triggers are active and working
- Students can post in enrolled courses only
- Instructors receive question notifications
- Voting updates vote_count correctly
- Bookmarks work as expected
- Users can only edit/delete own posts
- Admins can delete any post

## Usage

### For Students
1. Navigate to exercise page in enrolled course
2. Scroll to Q&A section below exercise content
3. Click button to ask new question
4. Enter question title and detailed description
5. Submit question (instructor receives notification)
6. View existing questions and answers
7. Click to answer questions or reply to answers
8. Use voting buttons to upvote/downvote helpful content
9. Click bookmark icon to save important posts
10. Edit or delete own questions and answers as needed

### For Instructors
1. View Q&A section on exercises in assigned courses
2. Receive notification when student posts question
3. Click notification link to navigate to question
4. Provide answer to student question
5. Vote on helpful questions and answers
6. Bookmark important discussions for reference
7. Edit or delete own posts

### For Admins
1. Access Q&A across all courses
2. Monitor discussions for inappropriate content
3. Delete any post if needed for moderation
4. View individual vote details for analytics
5. Manage Q&A system across entire platform

