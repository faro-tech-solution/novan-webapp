# Exercise Numbering System

## Overview

The exercise numbering system automatically displays exercise titles with numbers in the format `{number}. {title}` (e.g., "1. React Hooks Basics", "2. State Management"). The numbering is calculated based on the category order and the exercise order within each category.

## How It Works

### Order Index Calculation

The `order_index` field in the exercises table is calculated using the formula:
```
order_index = (category_order * 1000) + exercise_order_in_category
```

**Examples:**
- Category with order 0, Exercise 1: `order_index = 0 * 1000 + 0 = 0` → displays as "1. Exercise Title"
- Category with order 0, Exercise 2: `order_index = 0 * 1000 + 1 = 1` → displays as "2. Exercise Title"
- Category with order 0, Exercise 8: `order_index = 0 * 1000 + 7 = 7` → displays as "8. Exercise Title"
- Category with order 1, Exercise 1: `order_index = 1 * 1000 + 0 = 1000` → displays as "9. Exercise Title"
- Category with order 1, Exercise 2: `order_index = 1 * 1000 + 1 = 1001` → displays as "10. Exercise Title"

### Uncategorized Exercises

Exercises without a category are assigned high order_index values (999999+) to appear at the end of the list.

### Display Number Extraction

The display number is calculated in two ways:

1. **Within Category (Legacy)**: `displayNumber = (order_index % 1000) + 1`
   - Used when no exercises list is provided
   - Shows exercise number within its category

2. **Continuous Across Categories (New)**: `displayNumber = position_in_sorted_list + 1`
   - Used when exercises list is provided
   - Shows continuous numbering across all categories
   - Example: If first category has 8 exercises, first exercise in second category shows as "9. Exercise Title"

## Database Changes

### New Column
- `order_index` (INTEGER NOT NULL) - Calculated order based on category order and exercise order within category

### New Functions
- `calculate_exercise_order_index()` - Trigger function to calculate order_index on insert/update
- `recalculate_all_exercise_order_indexes()` - Function to recalculate all order_indexes
- `recalculate_exercise_order_indexes_on_category_change()` - Trigger function for category changes

### New Triggers
- `trigger_calculate_exercise_order_index` - Automatically calculates order_index when exercises are created/updated
- `trigger_recalculate_exercise_order_on_category_change` - Updates exercise order_index when category order changes

## Frontend Changes

### Updated Components
- `ExerciseInfoCard` - Displays numbered titles in exercise detail view
- `ExerciseCard` - Displays numbered titles in exercise lists

### New Utility Functions
- `formatExerciseTitleWithNumber()` - Formats title with number
- `getExerciseDisplayNumber()` - Extracts display number from order_index
- `getCategoryOrder()` - Extracts category order from order_index

### Updated Services
- `exerciseFetchService` - Now sorts by `order_index` instead of `sort`
- `exerciseOrderService` - New service for order operations

## Migration Instructions

1. **Apply the migration:**
   ```bash
   ./scripts/apply_exercise_order_migration.sh
   ```

2. **Verify the migration:**
   - Check that `order_index` column exists in exercises table
   - Verify that existing exercises have calculated order_index values
   - Test that exercises display with numbers

3. **Update types (if needed):**
   - The TypeScript types have been updated to include `order_index`
   - Regenerate Supabase types if using Supabase CLI

## Usage Examples

### Creating a New Exercise
The order_index is automatically calculated when an exercise is created:
```typescript
const { data, error } = await supabase
  .from('exercises')
  .insert({
    title: 'React Hooks Basics',
    category_id: 'category-uuid',
    // ... other fields
    // order_index will be calculated automatically
  });
```

### Reordering Categories
When category order changes, exercise order_indexes are automatically updated:
```typescript
// Update category order
await supabase
  .from('exercise_categories')
  .update({ order_index: 1 })
  .eq('id', 'category-uuid');
// Exercise order_indexes are automatically recalculated
```

### Manual Recalculation
If needed, you can manually recalculate all order_indexes:
```typescript
import { recalculateExerciseOrderIndexes } from '@/services/exerciseOrderService';

await recalculateExerciseOrderIndexes(courseId);
```

## Benefits

1. **Automatic Numbering** - Exercises are automatically numbered based on their position
2. **Category-Aware** - Numbers reflect the category structure
3. **Consistent Display** - All exercise titles show numbers in the same format
4. **Automatic Updates** - Numbers update automatically when categories or exercises are reordered
5. **Backward Compatible** - Existing exercises continue to work

## Troubleshooting

### Exercises Not Showing Numbers
1. Check that the migration was applied successfully
2. Verify that exercises have `order_index` values
3. Ensure the frontend components are using the updated code

### Wrong Numbers
1. Recalculate order_indexes using the service function
2. Check that category order_index values are correct
3. Verify that exercises are in the correct categories

### Performance Issues
1. The `order_index` column is indexed for better performance
2. Sorting by `order_index` is more efficient than complex category-based sorting
