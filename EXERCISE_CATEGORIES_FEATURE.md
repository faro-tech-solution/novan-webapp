# Exercise Categories Feature

## Overview

The Exercise Categories feature allows you to organize exercises within each course into logical groups or categories. This helps both instructors and students better understand the structure and progression of exercises in a course.

## Features

### For Admins and Trainers

1. **Create Categories**: Add new exercise categories to any course
2. **Edit Categories**: Modify category names and descriptions
3. **Delete Categories**: Remove categories (only if they contain no exercises)
4. **Reorder Categories**: Change the display order of categories
5. **View Exercise Count**: See how many exercises are in each category

### For Students

1. **View Organized Exercises**: See exercises grouped by categories
2. **Better Navigation**: Easier to find specific types of exercises
3. **Progress Tracking**: Understand which categories they've completed

## Database Schema

### New Table: `exercise_categories`

```sql
CREATE TABLE exercise_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(course_id, name)
);
```

### Updated Table: `exercises`

Added `category_id` column:
```sql
ALTER TABLE exercises ADD COLUMN category_id UUID REFERENCES exercise_categories(id) ON DELETE SET NULL;
```

## Security (RLS Policies)

- **Admins**: Can manage all categories
- **Trainers**: Can manage categories for courses they're assigned to
- **Instructors**: Can manage categories for courses they created
- **Students**: Can view categories for courses they're enrolled in

## Usage

### Accessing Exercise Categories

1. Go to **Course Management** page
2. Click the **three dots menu** on any course card
3. Select **"دسته‌بندی تمرینات"** (Exercise Categories)
4. A dialog will open showing all categories for that course

### Creating a Category

1. Click **"دسته‌بندی جدید"** (New Category) button
2. Enter a name for the category (required)
3. Optionally add a description
4. Click **"ایجاد"** (Create)

### Editing a Category

1. Hover over a category card to see edit/delete buttons
2. Click the edit icon (pencil)
3. Modify the name and/or description
4. Click **"بروزرسانی"** (Update)

### Deleting a Category

1. Hover over a category card
2. Click the delete icon (trash)
3. Confirm the deletion
4. **Note**: Categories with exercises cannot be deleted

## Migration

To apply the exercise categories feature to your database:

```bash
# Make sure DATABASE_URL is set
export DATABASE_URL="your-database-url"

# Run the migration
./scripts/apply_exercise_categories_migration.sh
```

## Testing

To verify the migration was applied correctly:

```bash
# Run the test script
psql "$DATABASE_URL" -f scripts/test_exercise_categories.sql
```

## Frontend Components

### New Components

- `ExerciseCategoriesDialog`: Main dialog for managing categories
- `useExerciseCategoriesQuery`: React Query hook for category operations
- `exerciseCategoryService`: Service layer for API calls

### Updated Components

- `CourseActions`: Added "Exercise Categories" menu item
- `CourseGrid`: Passes category management handler
- `CourseCardComponent`: Includes category management action
- `CourseManagement`: Main page with category dialog integration

## API Endpoints

The feature uses the following Supabase operations:

- `SELECT` from `exercise_categories` table
- `INSERT` into `exercise_categories` table
- `UPDATE` on `exercise_categories` table
- `DELETE` from `exercise_categories` table
- `UPDATE` on `exercises` table (for category assignment)

## Future Enhancements

1. **Bulk Operations**: Move multiple exercises between categories
2. **Category Templates**: Pre-defined category sets for common course types
3. **Category Analytics**: Track completion rates by category
4. **Nested Categories**: Support for sub-categories
5. **Category Permissions**: Fine-grained access control per category

## Troubleshooting

### Common Issues

1. **"Cannot delete category" error**: The category contains exercises. Move or delete the exercises first.

2. **Permission denied**: Check that your user role has the appropriate permissions for the course.

3. **Categories not showing**: Verify that the course has categories and they are marked as active.

### Database Issues

If you encounter database-related issues:

1. Check if the migration was applied: `\dt exercise_categories`
2. Verify RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'exercise_categories'`
3. Check foreign key constraints: `\d+ exercise_categories`

## Support

For issues or questions about the Exercise Categories feature, please check:

1. This documentation
2. The test script output
3. Database logs for any errors
4. Browser console for frontend errors 