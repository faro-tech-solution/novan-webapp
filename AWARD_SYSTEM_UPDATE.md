# Award System Update Documentation

## Overv### In TypeScript/React

Import the translation utilities and use them to display awards. Since the ### Running Migration Again

The migration scripts are now fully idempotent and can be safely run multiple times. They will:

- Skip creating columns that already exist
- Skip dropping columns that don't exist
- Check for existing indexes before creating them
- Safely replace views and functions
- Handle cases where name/description columns were already removed
- Ensure translation backup data is preserved and extended
- Safely create trigger functions and triggers
- Add proper error handling for all database operations

The migration will work whether:

1. This is the first time you're running it
2. You previously started but didn't complete the migration
3. The migration was already completed successfully no longer stores names and descriptions, it's **mandatory** to use the translation system:

````tsx
import { useAwardTranslation } from '@/utils/awardTranslationUtils';
import { AwardBadge } from '@/components/awards/AwardBadge';

// In your component:
const { translateAward } = useAwardTranslation();ward system has been updated to use a code-based approach instead of relying on award names. This makes the system more maintainable, allows for internationalization, and resolves issues with Persian award names not being recognized properly. The update also completely removes the name and description columns from the database in favor of client-side translations.

## Key Changes

1. **Database Updates**:

   - Added a `code` column to the `awards` table (unique identifier for each award)
   - **Removed** `name` and `description` columns from the awards table
   - Created a backup of all translations in `award_translations_backup` table
   - Updated the achievement function to use `code` instead of `name`

2. **TypeScript Translation System**:

   - Created `awardTranslations.ts` with translations for all awards
   - Added utility functions to get translations based on the user's language preference
   - Updated types to support the new code-based approach

3. **Components**:
   - Added `AwardBadge` and `AwardList` components that use the translation system
   - Added proper tooltips and styling for award badges

## Using the New System

### In SQL/Database

When referring to awards in SQL functions or queries, use only the `code` field as the `name` and `description` fields no longer exist:

```sql
-- Old way (no longer works)
SELECT * FROM awards WHERE name = 'First Submission';

-- New way
SELECT * FROM awards WHERE code = 'first_submission';

-- The awards table structure is now:
SELECT id, code, icon, points_value, rarity, category, created_at
FROM awards;

-- Name and description must be provided by the frontend
````

### In TypeScript/React

Import the translation utilities and use them to display awards. Since the database no longer stores names and descriptions, it's **mandatory** to use the translation system:

```tsx
import { useAwardTranslation } from "@/utils/awardTranslationUtils";
import { AwardBadge } from "@/components/awards/AwardBadge";

// In your component:
const { translateAward } = useAwardTranslation();

// Get a translated award
const firstSubmissionAward = translateAward("first_submission");
console.log(firstSubmissionAward.name); // Will show in user's language

// When using data from the database, you must use the translation system:
const awardFromDB = {
  id: "123",
  code: "first_submission",  // This is now the only identifier
  icon: "🎉",
  points_value: 50,
  rarity: "common",
    category: "academic",
  }}
/>;
```

## Award Codes List

| Code                | English Name        | Persian Name         |
| ------------------- | ------------------- | -------------------- |
| first_submission    | First Submission    | تولد یک کدنویس       |
| perfect_score       | Perfect Score       | استاد کامل           |
| high_achiever       | High Achiever       | نابغه برنامه‌نویسی   |
| academic_excellence | Academic Excellence | برتری علمی           |
| top_student         | Top Student         | دانشجوی برتر         |
| early_bird          | Early Bird          | تکمیل‌کننده زودهنگام |
| on_time             | On Time             | سرباز وقت‌شناس       |
| streak_master       | Streak Master       | قهرمان هفت روزه      |
| monthly_warrior     | Monthly Warrior     | جنگجوی ماهانه        |
| never_give_up       | Never Give Up       | هرگز تسلیم نشو       |
| fast_learner        | Fast Learner        | یادگیر سریع          |
| speed_demon         | Speed Demon         | شیطان سرعت           |
| exercise_enthusiast | Exercise Enthusiast | علاقمند به تمرین     |
| century_club        | Century Club        | باشگاه صدتایی‌ها     |
| night_owl           | Night Owl           | جغد شب               |
| weekend_warrior     | Weekend Warrior     | جنگجوی آخر هفته      |

## How to Apply the Update

Run the update script:

```bash
./scripts/update_awards_system.sh
```

This will:

1. Apply the database migration to add award codes
2. Remove name and description columns
3. Update the achievement function and dependent views
4. Check that all awards have been properly updated

## Troubleshooting

### Database Migration Issues

The migration scripts are now fully idempotent and can be safely run multiple times. If you encounter any errors:

1. **"column 'code' already exists" error**: This has been fixed - the migration will now skip adding columns that already exist.

2. **"null value in column 'en_name' violates not-null constraint"**: Fixed by making the translation columns nullable and ensuring data consistency.

3. **Missing columns or indexes**: The migration will automatically create any missing elements without failing.

4. Run the check script to verify award codes are in place:

   ```
   supabase db execute --file ./migrations/check_awards_table.sql
   ```

5. Run the verification script for detailed migration status:

   ```
   supabase db execute --file ./migrations/verify_award_migration.sql
   ```

6. Check the award_translations_backup table for data:

   ```sql
   SELECT * FROM award_translations_backup;
   ```

### Frontend Issues

1. Make sure you've updated all UI components to use the translation system. **Important:** Direct database queries will no longer include name or description fields.

2. If UI components are not displaying award names, check that the `code` property is properly mapped to the `AwardCode` type in awardTranslations.ts.

3. Check console errors to ensure translation functions are receiving valid award codes.

### Running Migration Again

The migration scripts can be safely run multiple times. They will:

- Skip creating columns that already exist
- Skip dropping columns that don't exist
- Check for existing indexes before creating them
- Safely replace views and functions

This makes the migration process robust and recoverable if any issues occur.
