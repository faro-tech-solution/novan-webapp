# Migration Plan: Features from chore/document-sql to Next.js

## Overview
Migrating features from the pre-Next.js `chore/document-sql` branch to the current Next.js project.

## Features to Migrate

### 1. Database Migrations
- [ ] `exercise_submissions_conversation` table
- [ ] Updated notifications table structure
- [ ] Any other schema changes

### 2. Conversation System
- [ ] `ExerciseConversation` component
- [ ] `rateAndConversation` component
- [ ] Conversation hooks (`useSubmissionConversation`, `useSendConversationMessage`)
- [ ] `fetchSubmissionConversation` service
- [ ] Database integration

### 3. Enhanced Notification System
- [ ] Updated notification service with caching
- [ ] Notification components and hooks

### 4. Rich Text Editor
- [ ] `RichTextEditor` component
- [ ] ReactQuill integration
- [ ] Styling and configuration

### 5. File Upload System
- [ ] `FileUpload` component
- [ ] `FilePreviewList` component
- [ ] `uploadImageToSupabase` utility
- [ ] Image preview dialog

### 6. Ticket System
- [ ] `TicketConversation` component
- [ ] Ticket-related services and hooks

### 7. Integration Points
- [x] Update existing pages to use new components (ExerciseDetail page updated)
- [x] Update imports and exports
- [ ] Test functionality

## Migration Steps

### Step 1: Database Migrations
1. Apply the conversation table migration
2. Apply notification table updates
3. Verify database schema

### Step 2: Core Components
1. Add RichTextEditor component
2. Add FileUpload and FilePreviewList components
3. Add ExerciseConversation component
4. Add TicketConversation component

### Step 3: Services and Hooks
1. Update exerciseDetailService with conversation functions
2. Add conversation hooks
3. Update notification service
4. Add file upload utilities

### Step 4: Integration
1. Update existing pages to use new components
2. Update component exports
3. Test all functionality

### Step 5: Testing and Validation
1. Test conversation functionality
2. Test file uploads
3. Test notifications
4. Verify all features work in Next.js environment

## Current Status
- [x] Step 1: Database Migrations (migration files created, need to apply to database)
- [x] Step 2: Core Components (RichTextEditor, FileUpload, FilePreviewList, ExerciseConversation added)
- [x] Step 3: Services and Hooks (conversation hooks and service functions added)
- [ ] Step 4: Integration
- [ ] Step 5: Testing and Validation 