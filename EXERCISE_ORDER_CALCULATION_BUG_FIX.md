# Exercise Order Calculation Bug Fix

## Problem Description

When changing the order of exercise categories, exercises within those categories were being recalculated incorrectly. Specifically:

- **Expected behavior**: Category 4 exercises should have `order_index` values starting from 4001, 4002, 4003, etc.
- **Actual behavior**: Category 4 exercises were getting `order_index` values starting from 1, 2, 3, etc.

## Root Cause

The bug was in the `recalculate_exercise_order_indexes_on_category_change()` function in `migrations/update_exercise_order_on_category_change.sql`. 

**Problematic code (lines 14-20):**
```sql
(SELECT COUNT(*) 
 FROM exercises e2 
 WHERE e2.category_id = exercises.category_id 
 AND e2.created_at <= exercises.created_at), 
0
```

This logic was recalculating exercise order within categories based on `created_at` timestamp instead of preserving the existing relative order of exercises within the category.

## The Fix

### 1. Updated Trigger Function

**File**: `migrations/fix_exercise_order_calculation_bug.sql`

**Key changes**:
- Preserve existing exercise order within category using `(exercises.order_index % 1000)`
- Instead of recalculating based on `created_at`, maintain the relative positions

**New logic**:
```sql
UPDATE exercises 
SET order_index = (
  SELECT 
    COALESCE(ec.order_index * 1000, 0) + 
    -- Preserve the existing exercise order within category
    (exercises.order_index % 1000)
  FROM exercise_categories ec
  WHERE ec.id = exercises.category_id
)
WHERE category_id = NEW.id;
```

### 2. Updated Recalculation Function

Also fixed `recalculate_all_exercise_order_indexes_after_reorder()` to preserve relative order within categories.

## How to Apply the Fix

### Option 1: Use the automated script
```bash
./scripts/fix_exercise_order_bug.sh
```

### Option 2: Apply manually
```bash
# Apply the fix
psql "$DATABASE_URL" -f migrations/fix_exercise_order_calculation_bug.sql

# If you have existing incorrect order_indexes, recalculate all:
psql "$DATABASE_URL" -f migrations/recalculate_all_exercise_orders.sql
```

## Verification

After applying the fix, verify that:

1. **Category order_indexes are correct**:
   ```sql
   SELECT 
       ec.id, ec.name, ec.order_index,
       MIN(e.order_index) as min_exercise_order,
       MAX(e.order_index) as max_exercise_order
   FROM exercise_categories ec
   LEFT JOIN exercises e ON e.category_id = ec.id
   GROUP BY ec.id, ec.name, ec.order_index
   ORDER BY ec.order_index;
   ```

2. **Exercises follow the correct formula**:
   ```sql
   SELECT 
       e.title,
       ec.name as category_name,
       ec.order_index as category_order,
       e.order_index,
       (e.order_index % 1000) as exercise_order_in_category,
       (ec.order_index * 1000) as expected_base_order
   FROM exercises e
   JOIN exercise_categories ec ON ec.id = e.category_id
   ORDER BY ec.order_index, e.order_index;
   ```

## Expected Results

After the fix:

- **Category 0**: Exercises have `order_index` 0, 1, 2, 3, ...
- **Category 1**: Exercises have `order_index` 1000, 1001, 1002, 1003, ...
- **Category 2**: Exercises have `order_index` 2000, 2001, 2002, 2003, ...
- **Category 3**: Exercises have `order_index` 3000, 3001, 3002, 3003, ...
- **Category 4**: Exercises have `order_index` 4000, 4001, 4002, 4003, ...

## Files Modified

1. `migrations/fix_exercise_order_calculation_bug.sql` - Main fix
2. `scripts/fix_exercise_order_bug.sh` - Automated application script
3. `migrations/recalculate_all_exercise_orders.sql` - Fix existing incorrect values
4. `EXERCISE_ORDER_CALCULATION_BUG_FIX.md` - This documentation

## Testing

To test the fix:

1. Create a test category with order_index 4
2. Add some exercises to it
3. Change the category order
4. Verify that exercises maintain their relative order and get correct order_index values (4000, 4001, 4002, etc.)

## Impact

- **Positive**: Exercises now maintain correct order_index values when categories are reordered
- **No breaking changes**: The fix preserves existing exercise order within categories
- **Performance**: No performance impact, same trigger-based approach
