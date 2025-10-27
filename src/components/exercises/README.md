# Exercise Components

This directory contains all exercise-related components organized by functionality.

## Directory Structure

```
exercises/
├── ExerciseHandler.tsx          # Global exercise handler (main component)
├── TraineeExerciseForm.tsx      # Legacy wrapper (uses ExerciseHandler)
├── ExercisesView.tsx            # Exercise list view
├── ExerciseConversation.tsx     # Exercise conversation/feedback
├── SubmissionViewer.tsx         # View exercise submissions
├── FeedbackForm.tsx             # Feedback form component
├── InstructorFormView.tsx       # Instructor view wrapper
├── players/                     # Media player components
│   ├── VideoPlayer.tsx
│   ├── AudioPlayer.tsx
│   ├── IframePlayer.tsx
│   ├── NegavidVideoPlayer.tsx
│   └── index.ts
├── forms/                       # Form-related components
│   ├── FormRenderer.tsx
│   ├── FormBuilder.tsx
│   └── index.ts
├── display/                     # Display components
│   ├── ExerciseCard.tsx
│   ├── ExerciseInfoCard.tsx
│   ├── ExerciseStatusBadges.tsx
│   ├── DraggableExerciseCard.tsx
│   └── index.ts
├── management/                  # Management components
│   ├── CreateExerciseForm.tsx
│   ├── ExerciseTypeSection.tsx
│   ├── BasicInfoSection.tsx
│   ├── CourseAndDifficultySection.tsx
│   ├── TimingAndPointsSection.tsx
│   └── index.ts
├── admin/                       # Admin-specific components
│   └── table/
│       ├── rateAndConversation.tsx
│       └── index.ts
└── index.ts                     # Main exports
```

## Exercise Types

The system supports two main categories of exercises:

### 1. Form-based Exercises
- **Type**: `form`
- **Behavior**: Requires form submission with answers
- **Components**: Uses `FormRenderer` for display and validation
- **Submission**: Manual submission with form validation

### 2. Media-based Exercises
- **Types**: `video`, `audio`, `iframe`, `negavid`
- **Behavior**: Requires completion tracking
- **Components**: Uses respective player components
- **Submission**: Automatic or manual completion tracking

## Usage

### Using ExerciseHandler (Recommended)

```tsx
import { ExerciseHandler } from '@/components/exercises';

<ExerciseHandler
  exercise={exercise}
  answers={answers}
  onAnswersChange={setAnswers}
  onSubmit={handleSubmit}
  submitting={submitting}
  userId={userId}
  mode="trainee" // or "instructor" or "admin"
/>
```

### Using Legacy TraineeExerciseForm

```tsx
import { TraineeExerciseForm } from '@/components/exercises';

<TraineeExerciseForm
  exercise={exercise}
  answers={answers}
  onAnswersChange={setAnswers}
  onSubmit={handleSubmit}
  submitting={submitting}
  userId={userId}
/>
```

## Exercise Handler Modes

- **trainee**: Full interaction, can submit answers and complete exercises
- **instructor**: Read-only view, can see exercise content but cannot submit
- **admin**: Administrative view with additional controls

## Adding New Exercise Types

1. Add the new type to `ExerciseType` in `@/types/exercise.ts`
2. Create a new player component in `players/` directory
3. Add the case to `renderMediaExercise()` in `ExerciseHandler.tsx`
4. Update the exports in `players/index.ts`

## Migration Notes

- `TraineeExerciseForm` is now a thin wrapper around `ExerciseHandler`
- All exercise type logic is centralized in `ExerciseHandler`
- Components are organized by functionality for better maintainability
- Backward compatibility is maintained through the main `index.ts` exports
