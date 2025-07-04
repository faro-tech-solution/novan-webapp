# Achievement System Migration

This directory contains SQL files for fixing and enhancing the achievement system.

## Current Files

- **achievement_system.sql**: The FINAL consolidated version that fixes all issues:
  - Resolves the ambiguous column reference problem
  - Adds null-safety checks for award IDs
  - Properly qualifies all column references
  - Improves logging and error reporting
  - Contains both the achievement function and trigger
  - **Updated to support Persian award names** like "تولد یک کدنویس"

- **check_awards_table.sql**: A diagnostic script that:
  - Lists all awards in the system
  - Counts awards by category
  - Checks for any missing required awards
  - Shows sample student awards
  
- **check_persian_awards.sql**: A script specifically to check the Persian award names:
  - Verifies "تولد یک کدنویس" (Birth of a Programmer) exists
  - Checks other Persian award names
  - Lists all award names for verification

- **test_persian_achievement.sql**: A test script to:
  - Manually test the achievement award function
  - Check if Persian awards are properly given to students

## Usage

Run the consolidated migration script:

```bash
./scripts/update_achievement_system.sh
```

This will:
1. Check if all necessary awards exist in the database
2. Apply the fixed achievement system migration

For the Persian award name fix, use:

```bash
./scripts/update_achievement_system_persian.sh
```

This script will:
1. Check if the Persian award names exist in the database
2. Apply the updated achievement system that supports both English and Persian award names

## Previous Versions (Archived)

The following files were iterative attempts to fix the issue and are now replaced by the consolidated file:

- enhance_achievement_function.sql: Original enhancement attempt
- enhance_achievement_function_fixed.sql: First fix for ambiguous column references
- enhance_achievement_function_fully_qualified.sql: Added more column qualifications
- enhance_achievement_function_null_safe.sql: Added null checking for award IDs
- fix_trigger_function.sql: Fixed the trigger function separately

These files have been consolidated into achievement_system.sql for clarity.
