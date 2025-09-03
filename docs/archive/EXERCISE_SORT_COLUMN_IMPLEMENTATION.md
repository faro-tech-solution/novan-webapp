# Exercise Sort Column Implementation

## Overview
Added a new `sort` column to the exercises table to enable custom ordering of exercises. Exercises are now sorted by the `sort` column (lowest to highest) and then by `created_at` (ascending) when sort values are equal or 0.

## Changes Made

### 1. Database Migration
- **File**: `migrations/add_sort_column_to_exercises.sql`
- **Changes**:
  - Added `sort` column (INTEGER NOT NULL DEFAULT 0) to exercises table
  - Created index on `sort` column for better performance
  - Created composite index on `(sort ASC, created_at ASC)` for optimal sorting

### 2. Type Definitions Updated
- **Files**: 
  - `src/integrations/supabase/types.ts`
  - `src/types/database.types.ts`
  - `src/types/exercise.ts`
- **Changes**: Added `sort: number` field to all exercise type definitions

### 3. Service Updates
- **File**: `src/services/exerciseFetchService.ts`
- **Changes**: Updated `fetchExercises` function to use new sorting logic:
  ```typescript
  .order('sort', { ascending: true })
  .order('created_at', { ascending: true })
  ```

### 4. Hook Updates
- **File**: `src/hooks/queries/useMyExercisesQuery.ts`
- **Changes**: Updated exercise query to use new sorting logic

- **File**: `src/hooks/useTraineeDashboard.ts`
- **Changes**: Updated exercise query to use new sorting logic

### 5. Migration Script
- **File**: `scripts/apply_sort_column_migration.sh`
- **Purpose**: Automated script to apply the database migration

## Sorting Logic
Exercises are now sorted using the following priority:
1. **Primary**: `sort` column (ascending - lowest to highest)
2. **Secondary**: `created_at` column (ascending) when sort values are equal or 0

## Usage
- Set `sort` value to 0 for default ordering (by creation date)
- Set `sort` value to positive integers for custom ordering (1, 2, 3, etc.)
- Lower sort values appear first in the list

## Migration Instructions
1. Run the migration script:
   ```bash
   ./scripts/apply_sort_column_migration.sh
   ```
2. The script will:
   - Add the sort column to the exercises table
   - Create necessary indexes
   - Set default value of 0 for existing exercises

## Benefits
- **Custom Ordering**: Instructors can now control the order of exercises
- **Backward Compatibility**: Existing exercises default to sort value of 0
- **Performance**: Optimized with proper indexes
- **Consistent**: All exercise queries now use the same sorting logic 