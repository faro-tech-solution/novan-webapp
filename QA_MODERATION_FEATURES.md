# Q&A Moderation Features Implementation

## Overview
This document describes the implementation of comprehensive Q&A moderation features for the admin panel, including database schema updates, TypeScript types, and service functions.

## Database Schema Changes

### New Fields Added to `exercise_questions` Table

```sql
-- Moderation status field
moderation_status TEXT DEFAULT 'pending' 
CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged'))

-- Admin management fields
is_pinned BOOLEAN DEFAULT false
is_resolved BOOLEAN DEFAULT false
admin_notes TEXT

-- Moderation tracking fields
moderated_by UUID REFERENCES auth.users(id)
moderated_at TIMESTAMPTZ

-- Performance optimization field
reply_count INTEGER DEFAULT 0
```

### New Indexes for Performance

```sql
CREATE INDEX idx_exercise_questions_moderation_status ON exercise_questions(moderation_status);
CREATE INDEX idx_exercise_questions_is_pinned ON exercise_questions(is_pinned);
CREATE INDEX idx_exercise_questions_is_resolved ON exercise_questions(is_resolved);
CREATE INDEX idx_exercise_questions_reply_count ON exercise_questions(reply_count);
CREATE INDEX idx_exercise_questions_moderated_by ON exercise_questions(moderated_by);
```

### Database Function for Moderation

A PostgreSQL function `moderate_question()` was created to handle moderation actions:

```sql
CREATE OR REPLACE FUNCTION moderate_question(
  question_id UUID,
  action TEXT,
  admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
```

**Supported Actions:**
- `approve` - Approve the question
- `reject` - Reject the question
- `flag` - Flag for review
- `pin` - Pin the question
- `unpin` - Unpin the question
- `resolve` - Mark as resolved
- `unresolve` - Mark as unresolved

### Automatic Reply Count Updates

A trigger `trigger_update_reply_count` automatically updates the `reply_count` field whenever replies are added, updated, or deleted.

## TypeScript Types

### Updated `ExerciseQuestion` Interface

```typescript
export interface ExerciseQuestion {
  // ... existing fields ...
  
  // Moderation fields
  moderation_status: 'pending' | 'approved' | 'rejected' | 'flagged';
  is_pinned: boolean;
  is_resolved: boolean;
  admin_notes: string | null;
  moderated_by: string | null;
  moderated_at: string | null;
  reply_count: number;
}
```

### New Moderation Types

```typescript
export type ModerationAction = 
  | 'approve' 
  | 'reject' 
  | 'flag' 
  | 'pin' 
  | 'unpin' 
  | 'resolve' 
  | 'unresolve';

export interface ModerationData {
  questionId: string;
  action: ModerationAction;
  adminNotes?: string;
}

export interface BulkModerationData {
  questionIds: string[];
  action: 'approve' | 'reject' | 'delete';
}
```

## Service Functions

### Updated Admin Functions

#### `fetchAdminQuestions()`
- Now includes moderation status filtering
- Returns all moderation fields from database
- Uses `reply_count` field for better performance

#### `fetchQAManagementStats()`
- Uses moderation status for accurate counts
- Separates pending, resolved, and flagged questions
- More efficient queries with proper indexing

#### `moderateQuestion()`
- Uses the database function for atomic operations
- Handles all moderation actions
- Includes admin notes support

#### `bulkModerateQuestions()`
- Supports bulk operations for efficiency
- Handles both moderation and deletion actions
- Uses individual moderation for complex actions

## Migration Files

### `migrations/add_qa_moderation_features.sql`
- Complete migration script with all schema changes
- Includes function creation and trigger setup
- Updates existing data with proper defaults

### `scripts/apply_qa_moderation_migration.sh`
- Executable script to apply the migration
- Includes error checking and validation
- Provides clear feedback on migration status

## Admin Panel Integration

### Q&A Management Page
The admin Q&A management page now supports:

1. **Status Filtering**: Filter questions by moderation status
2. **Moderation Actions**: Approve, reject, flag, pin, resolve questions
3. **Admin Notes**: Add notes for moderation decisions
4. **Bulk Operations**: Select multiple questions for bulk actions
5. **Real-time Updates**: Automatic reply count updates

### UI Components
- Status badges for moderation status
- Action buttons for moderation operations
- Admin notes display and editing
- Bulk selection checkboxes

## Security Considerations

### Row Level Security (RLS)
- Only admins can perform moderation actions
- Proper RLS policies for moderation fields
- Secure function execution with `SECURITY DEFINER`

### Data Validation
- Check constraints on moderation status
- Proper foreign key relationships
- Input validation in service functions

## Performance Optimizations

### Database Level
- Strategic indexing on frequently queried fields
- Denormalized `reply_count` for faster queries
- Efficient triggers for automatic updates

### Application Level
- Optimized queries with proper filtering
- Reduced database round trips
- Efficient data mapping and caching

## Usage Examples

### Moderate a Single Question
```typescript
await moderateQuestion('question-id', 'approve', 'This question is well-formatted and relevant');
```

### Bulk Moderate Questions
```typescript
await bulkModerateQuestions(['id1', 'id2', 'id3'], 'approve');
```

### Filter Questions by Status
```typescript
const pendingQuestions = await fetchAdminQuestions({
  status: 'pending',
  courseId: 'course-id'
});
```

## Testing Recommendations

1. **Database Migration**: Test migration on development database
2. **Function Testing**: Verify moderation function works correctly
3. **RLS Testing**: Ensure proper access control
4. **Performance Testing**: Check query performance with large datasets
5. **UI Testing**: Test all moderation features in admin panel

## Future Enhancements

1. **Moderation History**: Track all moderation actions
2. **Auto-moderation**: AI-powered content filtering
3. **Moderation Queue**: Prioritized moderation workflow
4. **Analytics**: Moderation statistics and reporting
5. **Notifications**: Alert admins of flagged content

## Troubleshooting

### Common Issues
1. **Migration Fails**: Check database permissions and constraints
2. **Function Errors**: Verify RLS policies and user roles
3. **Performance Issues**: Check index usage and query optimization
4. **UI Not Updating**: Verify React Query cache invalidation

### Debug Steps
1. Check database logs for errors
2. Verify user permissions and roles
3. Test functions directly in database
4. Check browser console for client-side errors
