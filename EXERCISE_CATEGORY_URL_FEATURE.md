# Exercise Category URL Query String Feature

## Overview
Added URL query string support for exercise category selection in both `/exercises` and `/my-exercises` pages. This allows users to share direct links to specific exercise categories.

## Implementation Details

### Changes Made
1. **Modified `ExercisesView` component** (`src/components/exercises/ExercisesView.tsx`):
   - Added `useRouter` and `useSearchParams` hooks from Next.js
   - Added `updateCategoryInUrl` function to manage URL query parameters
   - Added `handleCategorySelection` function to update both state and URL
   - Added `useEffect` to read initial category from URL on component mount
   - Updated all category selection handlers to use the new URL-aware function

### URL Structure
- **All exercises**: `/exercises` or `/my-exercises` (no query parameter)
- **Specific category**: `/exercises?category=CATEGORY_ID` or `/my-exercises?category=CATEGORY_ID`
- **Uncategorized exercises**: `/exercises?category=uncategorized` or `/my-exercises?category=uncategorized`

### Features
- ✅ URL updates when category is selected
- ✅ Category selection from URL on page load
- ✅ Browser back/forward navigation support
- ✅ Shareable links to specific categories
- ✅ Works on both mobile and desktop views
- ✅ Maintains existing functionality

### Usage Examples
```
# Link to all exercises
https://yourapp.com/portal/trainee/course123/exercises

# Link to specific category
https://yourapp.com/portal/trainee/course123/exercises?category=cat-456

# Link to uncategorized exercises
https://yourapp.com/portal/trainee/course123/exercises?category=uncategorized

# Link to my exercises with specific category
https://yourapp.com/portal/trainee/course123/my-exercises?category=cat-789
```

### Technical Notes
- Uses Next.js `router.replace()` to update URL without adding to browser history
- Query parameter is removed when "all" category is selected (cleaner URLs)
- Component state and URL stay synchronized
- No breaking changes to existing functionality

## Create/Edit Exercise Redirect Feature

### Overview
Added automatic redirect functionality after creating or editing exercises to redirect to the specific category where the exercise was created/edited.

### Implementation Details

### Changes Made
1. **Modified `CreateExercise` components**:
   - `src/components/pages/CreateExercise.tsx`
   - `src/components/pages/exercises/CreateExercise.tsx`
   - Added `useAuth` and `useDashboardPanelContext` hooks
   - Added `getExercisesPagePath` function to determine correct redirect path
   - Updated redirect logic to include category ID in URL

### Redirect Logic
- **Admin users**: Redirect to `/portal/admin/exercises?category=CATEGORY_ID`
- **Trainer users**: Redirect to `/portal/trainer/exercises?category=CATEGORY_ID`
- **Trainee users**: Redirect to `/portal/trainee/COURSE_ID/exercises?category=CATEGORY_ID`
- **No category selected**: Redirect without category parameter

### Features
- ✅ Automatic redirect after exercise creation
- ✅ Automatic redirect after exercise editing
- ✅ Role-based redirect paths
- ✅ Category-specific redirects
- ✅ Fallback to admin exercises page
- ✅ Works for both create and edit operations
