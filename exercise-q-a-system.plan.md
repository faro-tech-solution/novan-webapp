
# Exercise Q&A System
## Overview


A discussion system enabling students to ask questions about exercises and receive answers from instructors and peers. Features include threaded replies, voting, and bookmarking.


## Features by Role


**Students**
- Ask questions, provide answers, and reply to discussions
- Vote (upvote/downvote) and bookmark helpful content
- Edit/delete own posts


**Instructors**
- Answer questions in their courses
- Receive notifications for new questions
- Vote and bookmark content


**Admins**
- Full access and moderation across all courses
- View individual vote details


## Database Tables


- **exercise_qa**: Questions, answers, and replies (hierarchical with `parent_id`)
- **exercise_qa_vote**: User votes (+1 upvote, -1 downvote)
- **exercise_qa_bookmark**: User bookmarks


## Security


Row Level Security (RLS) enforces:
- Students: Access only enrolled courses
- Instructors: Access only their courses
- Admins: Full access
- All users can only edit/delete own posts


## Key Features
**Threaded Discussions:** Questions can have answers, answers can have replies
**Auto Vote Count:** Database triggers automatically calculate vote totals
**Notifications:** Instructors notified of new questions, users notified of replies
**Hierarchical Structure:** Single table stores questions and answers using `parent_id`


## Implementation


**Database:** 3 tables with RLS policies, triggers for vote counting and notifications
**TypeScript:** Types in `src/types/qa.ts`, helpers in `src/utils/qa-helpers.ts`
**Components:** QAList, QAItem, QAForm, VoteButtons, BookmarkButton
## Migration
Run migration file to create tables, RLS policies, functions, and triggers.
