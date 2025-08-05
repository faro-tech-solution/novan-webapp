# SpotPlayer Exercise Setup Guide

## Problem
SpotPlayer exercises are showing "این تمرین هنوز محتوایی ندارد" (This exercise doesn't have content yet) because they lack proper metadata configuration.

## Solution
SpotPlayer exercises need to have the correct metadata structure in the `metadata` field of the `exercises` table.

## Required Metadata Structure

When creating a SpotPlayer exercise, the `metadata` field must contain:

```json
{
  "spotplayer_course_id": "your_spotplayer_course_id",
  "spotplayer_item_id": "your_spotplayer_item_id",
  "spotplayer_license_key": "optional_license_key",
  "auto_create_license": false
}
```

### Required Fields:
- `spotplayer_course_id` (string): The SpotPlayer course ID - **REQUIRED**
- `spotplayer_item_id` (string, optional): The specific item/video ID within the course

### Optional Fields:
- `spotplayer_license_key` (string, optional): Pre-configured license key
- `auto_create_license` (boolean, optional): Whether to auto-create licenses

## How to Create SpotPlayer Exercises

### Option 1: Using the Utility Function (Recommended)

```typescript
import { createSpotPlayerExercise } from '@/utils/spotplayerExerciseUtils';

const exercise = await createSpotPlayerExercise({
  title: 'My SpotPlayer Video Exercise',
  description: 'Watch this video and complete the exercise',
  course_id: 'your-course-id',
  difficulty: 'beginner',
  points: 100,
  estimated_time: '30 minutes',
  created_by: 'user-id',
  spotplayerData: {
    spotplayer_course_id: 'your_spotplayer_course_id',
    spotplayer_item_id: 'your_spotplayer_item_id'
  }
});
```

### Option 2: Direct Database Insert

```sql
INSERT INTO exercises (
  title,
  description,
  course_id,
  difficulty,
  points,
  estimated_time,
  created_by,
  exercise_type,
  metadata
) VALUES (
  'My SpotPlayer Video Exercise',
  'Watch this video and complete the exercise',
  'your-course-id',
  'beginner',
  100,
  '30 minutes',
  'user-id',
  'spotplayer',
  '{"spotplayer_course_id": "your_spotplayer_course_id", "spotplayer_item_id": "your_spotplayer_item_id"}'
);
```

## Validation

The system automatically validates SpotPlayer exercises using the `hasValidSpotPlayerMetadata` function:

```typescript
import { hasValidSpotPlayerMetadata } from '@/utils/spotplayerExerciseUtils';

const isValid = hasValidSpotPlayerMetadata(exercise);
if (!isValid) {
  console.log('Exercise lacks valid SpotPlayer metadata');
}
```

## Common Issues and Solutions

### Issue 1: "این تمرین هنوز محتوایی ندارد" Error
**Cause**: Missing or invalid `spotplayer_course_id` in metadata
**Solution**: Ensure the exercise has proper metadata with `spotplayer_course_id`

### Issue 2: Metadata Not Parsing
**Cause**: Invalid JSON structure in metadata field
**Solution**: Use the utility functions to create/update exercises

### Issue 3: RLS Policy Errors
**Cause**: Not authenticated as a user with exercise creation permissions
**Solution**: Ensure you're logged in as a trainer/admin when creating exercises

## Testing

Use the provided test scripts to verify SpotPlayer exercise setup:

```bash
# Check existing SpotPlayer exercises
node scripts/check_spotplayer_data.js

# Test metadata parsing
node scripts/test_spotplayer_exercises.js
```

## Migration for Existing Exercises

If you have existing SpotPlayer exercises without proper metadata, you can update them:

```typescript
import { updateSpotPlayerExerciseMetadata } from '@/utils/spotplayerExerciseUtils';

await updateSpotPlayerExerciseMetadata(exerciseId, {
  spotplayer_course_id: 'your_spotplayer_course_id',
  spotplayer_item_id: 'your_spotplayer_item_id'
});
```

## Integration with SpotPlayer Service

The SpotPlayer exercises integrate with the `SpotPlayerService` to:
1. Manage user cookies and authentication
2. Create and validate licenses
3. Log stream access
4. Handle video playback

Make sure the SpotPlayer service is properly configured with your SpotPlayer API credentials. 