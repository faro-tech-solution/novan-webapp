# Step-by-Step Guide: Creating SpotPlayer Exercises

## Prerequisites
1. You must be logged in as a trainer or admin
2. You must have a course created
3. You need your SpotPlayer course ID and item ID

## Steps to Create a SpotPlayer Exercise

### 1. Access Exercise Creation
- Navigate to the course management section
- Go to "Exercises" or "Create Exercise"
- Select "SpotPlayer" as the exercise type

### 2. Fill in Basic Information
- **Title**: Give your exercise a descriptive title
- **Description**: Explain what the exercise is about
- **Difficulty**: Choose beginner, intermediate, or advanced
- **Points**: Set the points value for completing the exercise
- **Estimated Time**: How long the exercise should take

### 3. Configure SpotPlayer Settings
- **SpotPlayer Course ID**: Enter your SpotPlayer course ID (required)
- **SpotPlayer Item ID**: Enter the specific video/item ID (optional)
- **Auto Create License**: Check if you want automatic license creation

### 4. Save the Exercise
- Click "Create Exercise" or "Save"
- The system will automatically create the proper metadata structure

## Example Configuration

```
Title: "Introduction to React Hooks"
Description: "Watch the video about React Hooks and complete the quiz"
Difficulty: Beginner
Points: 100
Estimated Time: 45 minutes
SpotPlayer Course ID: "react-hooks-course-2024"
SpotPlayer Item ID: "hooks-introduction-video"
```

## Verification

After creating the exercise:

1. Navigate to the exercise in the trainee view
2. You should see the SpotPlayer video player instead of "این تمرین هنوز محتوایی ندارد"
3. The video should load and be playable

## Troubleshooting

### If you still see "این تمرین هنوز محتوایی ندارد":

1. **Check the exercise type**: Ensure it's set to "spotplayer"
2. **Verify metadata**: Check that the SpotPlayer Course ID is set
3. **Check permissions**: Ensure you have proper access to the course
4. **Clear cache**: Try refreshing the page or clearing browser cache

### If the video doesn't load:

1. **Verify SpotPlayer credentials**: Check your SpotPlayer API configuration
2. **Check course access**: Ensure the course ID is correct and accessible
3. **Verify user permissions**: Make sure the user has access to the SpotPlayer course

## Support

If you continue to have issues:
1. Check the browser console for error messages
2. Verify your SpotPlayer API configuration
3. Contact the system administrator 