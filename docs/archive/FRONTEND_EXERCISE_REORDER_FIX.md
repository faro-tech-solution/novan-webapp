# Frontend Exercise Reorder Fix

## Problem Description

The frontend reorder functionality was sending incorrect `order_index` values to the PATCH API when reordering exercises within categories. Specifically:

- **Expected behavior**: When reordering exercises in category 4, the API should receive `order_index` values like 4000, 4001, 4002, 4003, etc.
- **Actual behavior**: The frontend was sending simple array indices like 0, 1, 2, 3, etc., regardless of the category.

## Root Cause

The bug was in `src/components/exercises/ExercisesView.tsx` in the `handleDrop` function (lines 213-218):

**Problematic code:**
```typescript
const reorderData = newCategoryExercises.map((exercise, index) => ({
  exerciseId: exercise.id,
  newOrderIndex: index,  // ❌ Wrong! Just array index (0, 1, 2, 3...)
  courseId: courseId || '',
  categoryId: selectedCategoryId === 'uncategorized' ? null : selectedCategoryId
}));
```

This was using the simple array index instead of calculating the proper `order_index` based on the category's order and the exercise's position within that category.

## The Fix

### 1. Updated Frontend Logic

**File**: `src/components/exercises/ExercisesView.tsx`

**Key changes**:
- Import the `calculateReorderOrderIndex` utility function
- Calculate proper `order_index` values based on category order and exercise position
- Handle both categorized and uncategorized exercises correctly

**New logic**:
```typescript
const reorderData = newCategoryExercises.map((exercise, index) => {
  const isUncategorized = selectedCategoryId === 'uncategorized';
  const category = categories.find(cat => cat.id === selectedCategoryId);
  const categoryOrder = category?.order_index ?? 0;
  
  const newOrderIndex = calculateReorderOrderIndex(
    categoryOrder,
    index,
    isUncategorized
  );
  
  return {
    exerciseId: exercise.id,
    newOrderIndex,
    courseId: courseId || '',
    categoryId: selectedCategoryId === 'uncategorized' ? null : selectedCategoryId
  };
});
```

### 2. Added Utility Function

**File**: `src/utils/exerciseOrderUtils.ts`

**New function**:
```typescript
export const calculateReorderOrderIndex = (
  categoryOrder: number,
  exerciseIndexInCategory: number,
  isUncategorized: boolean = false
): number => {
  if (isUncategorized) {
    // For uncategorized exercises, use high order_index values (999999+)
    return 999999 + exerciseIndexInCategory;
  } else {
    // For categorized exercises, use the standard formula
    return calculateOrderIndex(categoryOrder, exerciseIndexInCategory);
  }
};
```

## How It Works Now

### For Categorized Exercises
- **Category 0**: Exercises get `order_index` 0, 1, 2, 3, ...
- **Category 1**: Exercises get `order_index` 1000, 1001, 1002, 1003, ...
- **Category 2**: Exercises get `order_index` 2000, 2001, 2002, 2003, ...
- **Category 3**: Exercises get `order_index` 3000, 3001, 3002, 3003, ...
- **Category 4**: Exercises get `order_index` 4000, 4001, 4002, 4003, ...

### For Uncategorized Exercises
- Exercises get `order_index` 999999, 1000000, 1000001, 1000002, ...

## Formula

The `order_index` is calculated using:
```
order_index = (category_order * 1000) + exercise_position_in_category
```

Where:
- `category_order` is the `order_index` from the `exercise_categories` table
- `exercise_position_in_category` is the 0-based position within the category

## Testing

To test the fix:

1. **Create test categories** with different order_index values (0, 1, 2, 3, 4)
2. **Add exercises** to each category
3. **Reorder exercises** within a category using drag & drop
4. **Verify** that the PATCH API receives correct `order_index` values
5. **Check** that exercises maintain proper numbering after reorder

## Expected API Calls

When reordering exercises in category 4, the PATCH API should now receive:

```json
[
  {
    "exerciseId": "exercise-1",
    "newOrderIndex": 4000,
    "courseId": "course-123",
    "categoryId": "category-4"
  },
  {
    "exerciseId": "exercise-2", 
    "newOrderIndex": 4001,
    "courseId": "course-123",
    "categoryId": "category-4"
  },
  {
    "exerciseId": "exercise-3",
    "newOrderIndex": 4002,
    "courseId": "course-123", 
    "categoryId": "category-4"
  }
]
```

Instead of the incorrect:
```json
[
  {
    "exerciseId": "exercise-1",
    "newOrderIndex": 0,  // ❌ Wrong!
    "courseId": "course-123",
    "categoryId": "category-4"
  },
  {
    "exerciseId": "exercise-2",
    "newOrderIndex": 1,  // ❌ Wrong!
    "courseId": "course-123", 
    "categoryId": "category-4"
  }
]
```

## Files Modified

1. `src/components/exercises/ExercisesView.tsx` - Fixed reorder logic
2. `src/utils/exerciseOrderUtils.ts` - Added utility function
3. `FRONTEND_EXERCISE_REORDER_FIX.md` - This documentation

## Impact

- **Positive**: Frontend now sends correct `order_index` values to the API
- **Consistent**: Exercise numbering works correctly across all categories
- **No breaking changes**: The fix maintains existing functionality while correcting the bug
- **Better UX**: Users see consistent exercise numbering after reordering

## Related Issues

This fix works in conjunction with the database-level fix in `migrations/fix_exercise_order_calculation_bug.sql` to ensure that:

1. **Frontend** sends correct `order_index` values
2. **Database triggers** preserve exercise order when categories are reordered
3. **Display logic** shows consistent exercise numbering

Both fixes are needed for the complete solution.
