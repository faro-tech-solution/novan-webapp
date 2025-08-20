# Negavid Exercise Type

This document describes the new `negavid` exercise type that integrates with Negavid's secure video CDN service.

## Overview

The `negavid` exercise type enables instructors to create video-based exercises using Negavid's secure CDN. This type provides a cleaner and more secure alternative to using iframe embeds for Negavid videos.

## Features

- **Secure Video CDN**: Uses Negavid's secure video delivery network
- **Simple Configuration**: Only requires a video ID instead of full HTML code
- **Clean Interface**: Dedicated form field for video ID input
- **Database Optimized**: Stores video ID in metadata JSON field for consistency with other exercise types
- **HLS Support**: Supports HLS streaming with MP4 fallback
- **IP-Based Security**: Generates secure, time-limited links based on user IP

## Usage

### For Instructors/Trainers

1. **Create Exercise**: Navigate to the exercise creation form
2. **Select Type**: Choose "ویدیو نگاود" (Negavid Video) as the exercise type
3. **Enter Video ID**: Provide the Negavid video ID (e.g., `c8a3062d-006b-45f7-8639-c20c9eee27d5`)
4. **Complete Setup**: Fill in other exercise details (title, description, points, etc.)
5. **Save**: The exercise is ready for students

### Video ID Format

The video ID is the identifier from Negavid's video service:
- Example: `39620`
- This ID is typically found in the Negavid video URL or embed code

## Technical Implementation

### Database Changes

- Added `negavid` to the `exercise_type` enum constraint
- Video ID is stored in the existing `metadata` JSON column
- Migration file: `migrations/add_negavid_exercise_type.sql`

### Files Created/Modified

#### New Files Created:
- `src/services/negavidVideoService.ts` - API service for Negavid video integration
- `src/components/exercises/NegavidVideoPlayer.tsx` - Video player component
- `src/utils/negavidVideoExerciseUtils.ts` - Utility functions for Negavid exercises
- `migrations/add_negavid_exercise_type.sql` - Database migration
- `scripts/apply_negavid_migration.sh` - Migration application script

#### Files Modified:
- `src/types/exercise.ts` - Added `negavid` to ExerciseType and `negavid_video_id` field
- `src/types/exerciseSubmission.ts` - Updated exercise type union
- `src/services/exerciseCreateService.ts` - Added negavid_video_id support in metadata
- `src/services/exerciseUpdateService.ts` - Added negavid_video_id metadata handling
- `src/services/exerciseDetailService.ts` - Added negavid_video_id extraction from metadata
- `src/services/exerciseFetchService.ts` - Added negavid_video_id extraction from metadata for editing forms
- `src/components/exercises/CreateExerciseForm.tsx` - Updated form schema
- `src/components/exercises/ExerciseTypeSection.tsx` - Added Negavid Video option and input field
- `src/components/exercises/TraineeExerciseForm.tsx` - Added Negavid Video display section
- `src/components/pages/exercises/ExerciseDetail.tsx` - Added Negavid Video display section

### Components

- **ExerciseTypeSection**: Updated to include Negavid Video radio button option
- **CreateExerciseForm**: Updated form schema to validate negavid_video_id field
- **NegavidVideoPlayer**: Dedicated video player component with HLS support
- **TraineeExerciseForm**: Handles Negavid video display for students

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Negavid API Configuration
NEXT_PUBLIC_NEGAVID_ACCESS_TOKEN=your_negavid_access_token_here
```

## Migration

To apply the database changes:

```bash
./scripts/apply_negavid_migration.sh
```

Or manually run the SQL commands in `migrations/add_negavid_exercise_type.sql`.

## Example Usage

### Creating a Negavid Video Exercise

1. Navigate to exercise creation (Admin/Trainer dashboard → Create Exercise)
2. Fill in basic information:
   - Title: "Introduction to Programming"
   - Description: "Watch this video to learn programming basics"
   - Course: Select appropriate course
   - Difficulty: Select difficulty level
3. Select "ویدیو نگاود" as exercise type
4. Enter the Negavid video ID: `39620`
5. Set points and estimated time
6. Save the exercise

## Trainee Experience

### For Students/Trainees

1. **Access Exercise**: Navigate to the Negavid Video exercise
2. **Automatic Loading**: Video URL is automatically fetched with secure, time-limited link
3. **Watch Video**: Video player loads with native browser controls
4. **Complete Exercise**: Click "تکمیل تمرین" button after watching
5. **Submit**: Exercise is marked as completed

### Video Security Features

- **Embed Player**: Uses Negavid's secure embed player
- **Access Token Authentication**: Secure API access with Bearer token
- **Ready Status Check**: Verifies video is ready for playback
- **Embed Script Support**: Includes necessary scripts for full functionality

## API Integration

The Negavid video service integrates with the Negavid API to:

1. **Fetch Video Data**: Retrieve video information including embed player HTML
2. **Embed Player**: Use Negavid's secure embed player for video playback
3. **Status Verification**: Check if video is ready for playback
4. **Error Handling**: Graceful error handling and retry mechanisms

## Video Player Features

- **Embed Player**: Uses Negavid's official embed player
- **Video Information**: Displays video title, description, duration, and view count
- **Loading States**: Proper loading and error states
- **Retry Mechanism**: Automatic retry on connection issues
- **Security Notice**: Informs users about Negavid's security features

## Error Handling

The system handles various error scenarios:

- **Invalid Video ID**: Shows appropriate error message
- **Video Not Ready**: Displays processing status
- **API Errors**: Graceful error handling with retry options
- **Network Issues**: Automatic fallback and retry mechanisms

## Security Considerations

- **Access Token**: Secure API access with Bearer token authentication
- **Embed Player**: Uses Negavid's secure embed player
- **Status Verification**: Ensures video is ready and accessible
- **Secure API**: All API calls use secure authentication

## Performance Optimizations

- **Lazy Loading**: Video player loads only when needed
- **Caching**: Video metadata is cached appropriately
- **Embed Player**: Uses Negavid's optimized embed player
- **Status Check**: Efficient status verification before loading

## Troubleshooting

### Common Issues

1. **Video Not Loading**: Check API key and base URL configuration
2. **Invalid Video ID**: Verify the video ID format and existence
3. **Permission Errors**: Ensure API key has proper permissions
4. **Network Issues**: Check internet connection and API availability

### Debug Information

The system provides detailed logging for debugging:
- API request/response logging
- Video loading status
- Error details and stack traces
- Performance metrics

## Future Enhancements

Potential improvements for the Negavid exercise type:

- **Analytics Integration**: Track video viewing metrics
- **Advanced Security**: Additional security measures
- **Custom Player**: Enhanced video player with custom controls
- **Bulk Operations**: Support for bulk video operations
- **Advanced Metadata**: Rich video metadata support

## Support

For issues related to the Negavid exercise type:

1. Check the environment variables configuration
2. Verify the video ID format and existence
3. Review the browser console for error messages
4. Check the network tab for API request failures
5. Ensure the Negavid API service is available

The Negavid exercise type provides a robust, secure, and user-friendly way to integrate video content into the learning platform.
