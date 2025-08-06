# Arvan Video Exercise Type

This document describes the new `arvan_video` exercise type that integrates with ArvanCloud's secure video CDN service.

## Overview

The `arvan_video` exercise type enables instructors to create video-based exercises using ArvanCloud's secure CDN. This type provides a cleaner and more secure alternative to using iframe embeds for Arvan videos.

## Features

- **Secure Video CDN**: Uses ArvanCloud's secure video delivery network
- **Simple Configuration**: Only requires a video ID instead of full HTML code
- **Clean Interface**: Dedicated form field for video ID input
- **Database Optimized**: Stores video ID in metadata JSON field for consistency with other exercise types

## Usage

### For Instructors/Trainers

1. **Create Exercise**: Navigate to the exercise creation form
2. **Select Type**: Choose "ویدیو آروان" (Arvan Video) as the exercise type
3. **Enter Video ID**: Provide the Arvan video ID (e.g., `waV5ZLBklg`)
4. **Complete Setup**: Fill in other exercise details (title, description, points, etc.)
5. **Save**: The exercise is ready for students

### Video ID Format

The video ID is the identifier from ArvanCloud's video service:
- Example: `waV5ZLBklg`
- This ID is typically found in the ArvanCloud video URL or embed code

## Technical Implementation

### Database Changes

- Added `arvan_video` to the `exercise_type` enum constraint
- Video ID is stored in the existing `metadata` JSON column (following the same pattern as SpotPlayer)
- Migration file: `migrations/add_arvan_video_exercise_type.sql`

### Files Modified

- `src/types/exercise.ts` - Added `arvan_video` to ExerciseType and `arvan_video_id` field to ExerciseDetail interface
- `src/types/exerciseSubmission.ts` - Updated exercise type union
- `src/services/exerciseCreateService.ts` - Added arvan_video_id support in metadata
- `src/services/exerciseUpdateService.ts` - Added arvan_video_id metadata handling
- `src/services/exerciseDetailService.ts` - Added arvan_video_id extraction from metadata
- `src/services/exerciseFetchService.ts` - Added arvan_video_id extraction from metadata for editing forms
- `src/pages/exercises/CreateExercise.tsx` - Added arvan_video_id loading for editing
- `src/pages/exercises/ExerciseDetail.tsx` - Added Arvan Video display section
- `src/components/exercises/CreateExerciseForm.tsx` - Updated form schema
- `src/components/exercises/ExerciseTypeSection.tsx` - Added Arvan Video option and input field

### Components

- **ExerciseTypeSection**: Updated to include Arvan Video radio button option
- **CreateExerciseForm**: Updated form schema to validate arvan_video_id field
- **Exercise Creation Service**: Handles saving arvan_video_id to database

## Migration

To apply the database changes:

```bash
./scripts/apply_arvan_video_migration.sh
```

Or manually run the SQL commands in `migrations/add_arvan_video_exercise_type.sql`.

## Example Usage

### Creating an Arvan Video Exercise

1. Navigate to exercise creation (Admin/Trainer dashboard → Create Exercise)
2. Fill in basic information:
   - Title: "Introduction to Programming"
   - Description: "Watch this video to learn programming basics"
   - Course: Select appropriate course
   - Difficulty: Select difficulty level
3. Select "ویدیو آروان" as exercise type
4. Enter the Arvan video ID: `waV5ZLBklg`
5. Set points and estimated time
6. Save the exercise

## Trainee Experience

### For Students/Trainees

1. **Access Exercise**: Navigate to the Arvan Video exercise
2. **Automatic Loading**: Video URL is automatically fetched with secure, time-limited link
3. **Watch Video**: Video player loads with native browser controls
4. **Complete Exercise**: Click "تکمیل تمرین" button after watching
5. **Submit**: Exercise is marked as completed

### Video Security Features

- **IP-Specific Links**: Video URLs are generated for the user's specific IP address
- **Time-Limited Access**: Links expire after 1 hour for security
- **Automatic Refresh**: System handles link renewal when needed
- **CDN Delivery**: Fast, secure video delivery through ArvanCloud CDN

## Technical Implementation - Trainee Side

### Components Added

- **ArvanVideoPlayer**: Main video player component with error handling and loading states
- **ArvanVideoService**: API service to fetch secure video URLs from ArvanCloud
- **ArvanVideoExerciseUtils**: Utility functions for metadata validation and extraction

### API Integration

The system integrates with ArvanCloud API:
```
GET {{baseUrl}}/videos/:video?secure_ip={ip}&secure_expire_time={timestamp}
Authorization: Bearer {api_key}
```

### Environment Variables Required

Add these variables to your `.env.local` file:

```env
# Arvan Cloud API Base URL
NEXT_PUBLIC_ARVAN_CLOUD_BASE_URL=https://napi.arvancloud.ir/vod/2.0

# Arvan Cloud API Key (get from your Arvan Cloud dashboard)
NEXT_PUBLIC_ARVAN_CLOUD_API_KEY=your_api_key_here
```

**Important**: These variables are prefixed with `NEXT_PUBLIC_` to make them available in the browser for client-side API calls to fetch secure video URLs.

### Files Added for Trainee Support

- `src/services/arvanVideoService.ts` - API integration with ArvanCloud
- `src/components/exercises/ArvanVideoPlayer.tsx` - Video player component
- `src/utils/arvanVideoExerciseUtils.ts` - Utility functions for metadata handling
- Updated `src/components/exercises/TraineeExerciseForm.tsx` - Integrated Arvan video support

## Future Enhancements

- **Progress Tracking**: Track video watch progress and completion percentage
- **Quality Selection**: Allow students to choose video quality if multiple available
- **Subtitles Support**: Support for video subtitles if available
- **Offline Download**: Allow temporary offline access where permitted
- **Analytics**: Track viewing patterns and engagement metrics

## Security Considerations

- **Video ID Validation**: Consider adding validation for video ID format
- **Access Control**: Ensure only authorized users can access videos
- **CDN Security**: Leverages ArvanCloud's built-in security features

## Troubleshooting

### Common Issues

1. **Invalid Video ID**: Ensure the video ID is correct and the video exists in ArvanCloud
2. **Access Issues**: Verify that the video is accessible with the provided credentials
3. **Form Validation**: Ensure the video ID field is properly filled when creating exercises

### Debug Steps

1. Check if the video ID is valid in ArvanCloud dashboard
2. Verify database migration was applied successfully
3. Check browser console for any validation errors
4. Ensure form submission includes arvan_video_id field

## Recent Fixes

### Video ID Not Showing in Edit Form (Fixed)
**Issue**: When editing an Arvan Video exercise, the video ID textbox was empty.
**Root Cause**: The `fetchExerciseById` service was not extracting `arvan_video_id` from metadata like it did for SpotPlayer fields.
**Solution**: Updated `fetchExerciseById` and `fetchExercises` functions to extract `arvan_video_id` from metadata and add it as a direct property to the exercise object, consistent with SpotPlayer field handling.