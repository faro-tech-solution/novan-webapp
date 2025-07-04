# Database Migration Instructions

## Adding Instruction Field to Tasks Table

This document explains how to add the `instruction` field to your tasks table in Supabase.

## Migration Files Created

1. **`add_instruction_to_tasks.sql`** - General SQL migration
2. **`supabase_migration_add_instruction.sql`** - Supabase-specific migration format
3. **`rollback_instruction_from_tasks.sql`** - Rollback migration

## How to Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended for Development)

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the content from `supabase_migration_add_instruction.sql`
4. Run the SQL query

### Option 2: Using Supabase CLI (Recommended for Production)

1. If you haven't already, initialize migrations in your project:

   ```bash
   supabase migration list
   ```

2. Create a new migration file:

   ```bash
   supabase migration new add_instruction_to_tasks
   ```

3. Copy the content from `supabase_migration_add_instruction.sql` into the newly created migration file

4. Apply the migration:
   ```bash
   supabase db push
   ```

### Option 3: Direct SQL Execution

If you have direct database access, you can run the SQL from `add_instruction_to_tasks.sql` directly:

```sql
ALTER TABLE tasks
ADD COLUMN instruction TEXT;

COMMENT ON COLUMN tasks.instruction IS 'Detailed instructions for the task';
```

## Verification

After applying the migration, verify that the column was added successfully:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks' AND column_name = 'instruction';
```

Expected result: You should see a row with:

- `column_name`: instruction
- `data_type`: text
- `is_nullable`: YES

## Testing the Feature

1. After applying the migration, start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to the Tasks Management page
3. Create a new task and add instructions in the instruction field
4. Verify that you can view the instructions using the "مشاهده دستورالعمل" button

## Rollback Instructions

If you need to rollback this migration:

1. **Using Supabase Dashboard**: Run the SQL from `rollback_instruction_from_tasks.sql`
2. **Using direct SQL**:
   ```sql
   ALTER TABLE tasks DROP COLUMN IF EXISTS instruction;
   ```

## Notes

- The `instruction` field is optional (nullable)
- The field accepts unlimited text length
- No default value is set
- Existing tasks will have `NULL` for the instruction field until updated
- The UI handles `NULL` values by showing a "-" placeholder

## Row Level Security (RLS)

If you have Row Level Security enabled on your tasks table, the new column will inherit the same access patterns as other columns. No additional RLS policies are typically needed for adding a new column.

## Troubleshooting

### Common Issues:

1. **Permission Error**: Make sure you have sufficient database privileges
2. **Column Already Exists**: If you get an error that the column already exists, check if the migration was already applied
3. **RLS Issues**: If you can't read/write the instruction field, check your RLS policies

### Support

If you encounter any issues with the migration, you can:

1. Check the Supabase logs in your dashboard
2. Verify your database schema
3. Test with a simple query to ensure the column exists and is accessible
