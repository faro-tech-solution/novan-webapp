# Iframe Exercise Type

This document describes the new iframe exercise type that allows embedding external content from various services using full HTML code.

## Overview

The iframe exercise type enables instructors to create exercises that embed external content (videos, interactive content, etc.) from third-party services using complete HTML code including styling and responsive design.

## Features

- **Full HTML Support**: Embed complete HTML code including CSS styles and responsive containers
- **Custom Styling**: Support for custom CSS classes and responsive design
- **Complex Embeds**: Handle complex iframe configurations with multiple attributes
- **Completion Tracking**: Students can mark exercises as completed after viewing the content
- **Responsive Design**: HTML content adapts to different screen sizes
- **Error Handling**: Graceful error handling for failed iframe loads

## Usage

### For Instructors

1. **Create Exercise**: Go to the exercise creation form
2. **Select Type**: Choose "iframe" as the exercise type
3. **Enter HTML Code**: Provide the complete HTML code in the iframe_html field
4. **Save**: The exercise is now ready for students

### For Students

1. **Access Exercise**: Navigate to the iframe exercise
2. **View Content**: The embedded content will load automatically
3. **Complete**: Click "تکمیل تمرین" (Complete Exercise) after viewing
4. **Submit**: The exercise is marked as completed

## Supported HTML Formats

The iframe exercise type supports various HTML embed codes:

### ArvanCloud Video Player
```html
<style>.r1_iframe_embed {position: relative; overflow: hidden; width: 100%; height: auto; padding-top: 56.25%; } .r1_iframe_embed iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }</style><div class="r1_iframe_embed"><iframe src="https://player.arvancloud.ir/index.html?config=https://novan.arvanvod.ir/waV5ZLBklg/vDOWJgjqBL/origin_config.json" style="border:0 #ffffff none;" name="00-001.mp4" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe></div>
```

### YouTube Embed
```html
<style>.video-container {position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%;} .video-container iframe {position: absolute; top: 0; left: 0; width: 100%; height: 100%;}</style><div class="video-container"><iframe src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allowfullscreen></iframe></div>
```

### Vimeo Embed
```html
<style>.vimeo-container {position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%;} .vimeo-container iframe {position: absolute; top: 0; left: 0; width: 100%; height: 100%;}</style><div class="vimeo-container"><iframe src="https://player.vimeo.com/video/VIDEO_ID" frameborder="0" allowfullscreen></iframe></div>
```

### Custom Interactive Content
Any iframe-compatible HTML code with custom styling and responsive design.

## Security Considerations

- **HTML Sanitization**: Consider implementing HTML sanitization for security
- **Content Validation**: Validate HTML content before embedding
- **CSP Compliance**: Ensure Content Security Policy allows iframe sources
- **XSS Prevention**: Be cautious with user-provided HTML content

## Technical Implementation

### Database Changes

- Added 'iframe' to the exercise_type enum
- Added iframe_html TEXT column to exercises table
- Updated database constraints to allow iframe type
- Migration files: 
  - `migrations/add_iframe_exercise_type.sql`
  - `migrations/add_iframe_html_column.sql`

### Components

- **IframePlayer**: Main component for rendering HTML iframe content
- **ExerciseTypeSection**: Updated to include iframe option with textarea
- **TraineeExerciseForm**: Updated to handle iframe HTML rendering
- **ExerciseDetail**: Updated to show iframe HTML content for instructors

### Files Modified

- `src/types/exercise.ts` - Added iframe to ExerciseType and iframe_html field
- `src/types/exerciseSubmission.ts` - Updated exercise type union
- `src/components/exercises/CreateExerciseForm.tsx` - Updated form schema
- `src/components/exercises/ExerciseTypeSection.tsx` - Added iframe HTML textarea
- `src/components/exercises/TraineeExerciseForm.tsx` - Added iframe HTML rendering
- `src/pages/exercises/ExerciseDetail.tsx` - Added iframe HTML display
- `src/components/exercises/IframePlayer.tsx` - Updated to render HTML content
- `src/components/exercises/index.ts` - Added export
- `src/services/exerciseCreateService.ts` - Added iframe_html support

## Migration

To apply the database changes:

```bash
./scripts/apply_iframe_migration.sh
```

## Example Usage

### Creating an iframe Exercise

1. Navigate to exercise creation
2. Fill in basic information (title, description, etc.)
3. Select "iframe" as exercise type
4. Enter complete HTML code in the iframe_html textarea
5. Set points and timing
6. Save the exercise

### Student Experience

Students will see:
- Loading indicator while iframe loads
- Embedded content with original styling and responsive design
- Completion button to mark exercise as done
- Error handling if content fails to load

## Troubleshooting

### Common Issues

1. **Content Not Loading**: Check if the HTML code is valid and complete
2. **Styling Issues**: Ensure CSS classes are properly defined
3. **Responsive Problems**: Verify responsive design CSS is included
4. **Security Errors**: Check if the source domain allows iframe embedding

### Debug Steps

1. Check browser console for iframe errors
2. Verify HTML code validity
3. Test iframe HTML directly in browser
4. Check Content Security Policy settings

## Future Enhancements

- **HTML Sanitization**: Implement HTML sanitization for security
- **Template Library**: Provide pre-built HTML templates for common services
- **Analytics**: Track iframe view duration and completion rates
- **Custom Styling**: Allow custom iframe styling options
- **Multiple Sources**: Support for multiple iframe sources in one exercise
- **Progress Tracking**: Track partial completion based on iframe events 