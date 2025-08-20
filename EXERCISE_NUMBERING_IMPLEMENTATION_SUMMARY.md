# Exercise Numbering System - Implementation Summary

## Overview
Implemented a comprehensive exercise numbering system that automatically displays exercise titles with numbers in the format `{number}. {title}`. The numbering is calculated based on category order and exercise order within each category.

## Changes Made

### 1. Database Migrations

#### `migrations/add_order_index_to_exercises.sql`
- Added `order_index` column to exercises table
- Created `calculate_exercise_order_index()` function to calculate order_index based on category order and exercise order within category
- Created trigger to automatically calculate order_index on exercise insert/update
- Created `recalculate_all_exercise_order_indexes()` function for bulk updates
- Updated existing exercises with calculated order_index values
- Added index for better performance

#### `migrations/update_exercise_order_on_category_change.sql`
- Created trigger to update exercise order_index when category order changes
- Created function to recalculate all exercise order_indexes after category reordering

### 2. Type Definitions

#### `src/types/database.types.ts`
- Added `order_index: number` to exercises table Row, Insert, and Update types

#### `src/types/exercise.ts`
- Added `order_index: number` to `Exercise` interface
- Added `order_index?: number` to `MyExerciseWithSubmission` interface
- Added `order_index?: number` to `ExerciseDetail` interface

### 3. Frontend Components

#### `src/components/exercises/ExerciseInfoCard.tsx`
- Added import for `formatExerciseTitleWithNumber` utility
- Modified to display numbered titles in exercise detail view
- Uses `exercise.order_index` to format title as `"{number}. {title}"`

#### `src/components/exercises/ExerciseCard.tsx`
- Added import for `formatExerciseTitleWithNumber` utility
- Modified to display numbered titles in exercise lists
- Uses `exercise.order_index` to format title as `"{number}. {title}"`

### 4. Utility Functions

#### `src/utils/exerciseOrderUtils.ts` (New File)
- `getExerciseDisplayNumber()` - Extracts display number from order_index
- `getCategoryOrder()` - Extracts category order from order_index
- `formatExerciseTitleWithNumber()` - Formats title with number
- `calculateOrderIndex()` - Calculates order_index for new exercises
- `isUncategorizedExercise()` - Checks if exercise is uncategorized

### 5. Services

#### `src/services/exerciseFetchService.ts`
- Updated to sort by `order_index` instead of `sort` and `category_id`
- Simplified sorting logic for better performance

#### `src/services/exerciseOrderService.ts` (New File)
- `recalculateExerciseOrderIndexes()` - Recalculates all order_indexes for a course
- `recalculateCategoryExerciseOrderIndexes()` - Recalculates order_indexes for a specific category
- `updateExerciseOrderIndex()` - Updates order_index for a single exercise
- `getNextOrderIndexForCategory()` - Gets next available order_index for new exercises

#### `src/services/exerciseCategoryService.ts`
- Updated `reorderExerciseCategories()` to note that triggers handle exercise order updates automatically

### 6. Migration Scripts

#### `scripts/apply_exercise_order_migration.sh` (New File)
- Automated script to apply both migrations
- Includes verification and next steps instructions

## How the System Works

### Order Index Calculation
```
order_index = (category_order * 1000) + exercise_order_in_category
```

**Examples:**
- Category 0, Exercise 1: `order_index = 0 * 1000 + 1 = 1`
- Category 0, Exercise 2: `order_index = 0 * 1000 + 2 = 2`
- Category 1, Exercise 1: `order_index = 1 * 1000 + 1 = 1001`
- Category 1, Exercise 2: `order_index = 1 * 1000 + 2 = 1002`

### Display Number Extraction
```typescript
displayNumber = order_index % 1000
```

### Uncategorized Exercises
Exercises without categories get high order_index values (999999+) to appear at the end.

## Automatic Updates

1. **Exercise Creation/Update**: Trigger automatically calculates order_index
2. **Category Reordering**: Trigger automatically updates exercise order_indexes
3. **Category Assignment**: Trigger recalculates order_index when exercise category changes

## Benefits

1. **Automatic Numbering**: No manual intervention required
2. **Category-Aware**: Numbers reflect the category structure
3. **Consistent Display**: All exercise titles show numbers in the same format
4. **Automatic Updates**: Numbers update automatically when categories or exercises are reordered
5. **Backward Compatible**: Existing exercises continue to work
6. **Performance**: Indexed sorting for better performance

## Next Steps

1. **Apply Migration**: Run `./scripts/apply_exercise_order_migration.sh`
2. **Test Functionality**: Verify exercises display with numbers
3. **Update Supabase Types**: Regenerate types if using Supabase CLI
4. **Monitor Performance**: Ensure sorting performance is acceptable

## Files Created/Modified

### New Files
- `migrations/update_exercise_order_on_category_change.sql`
- `src/utils/exerciseOrderUtils.ts`
- `src/services/exerciseOrderService.ts`
- `scripts/apply_exercise_order_migration.sh`
- `EXERCISE_NUMBERING_SYSTEM.md`
- `EXERCISE_NUMBERING_IMPLEMENTATION_SUMMARY.md`

### Modified Files
- `migrations/add_order_index_to_exercises.sql`
- `src/types/database.types.ts`
- `src/types/exercise.ts`
- `src/components/exercises/ExerciseInfoCard.tsx`
- `src/components/exercises/ExerciseCard.tsx`
- `src/services/exerciseFetchService.ts`
- `src/services/exerciseCategoryService.ts`
