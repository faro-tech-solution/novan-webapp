-- verify_award_migration.sql
-- This script checks the current state of the award system after migration
-- It verifies the code column exists and the name/description columns have been dropped

DO $$
DECLARE
    column_count INTEGER;
    record_count INTEGER;
    backup_count INTEGER;
    view_exists BOOLEAN;
    function_exists BOOLEAN;
    result_text TEXT;
BEGIN
    -- Check the structure of the awards table
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'awards';
    
    -- Check if 'code' column exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'awards'
          AND column_name = 'code'
    ) INTO result_text;
    
    RAISE NOTICE 'Awards table has % columns', column_count;
    RAISE NOTICE 'Code column exists: %', result_text;
    
    -- Check that name and description columns don't exist
    SELECT NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'awards'
          AND column_name IN ('name', 'description')
    ) INTO result_text;
    
    RAISE NOTICE 'Name and description columns removed: %', result_text;
    
    -- Count awards and check they all have codes
    SELECT COUNT(*) INTO record_count
    FROM public.awards;
    
    SELECT COUNT(*) INTO column_count
    FROM public.awards
    WHERE code IS NOT NULL;
    
    RAISE NOTICE 'Awards in database: %', record_count;
    RAISE NOTICE 'Awards with valid codes: %', column_count;
    RAISE NOTICE 'All awards have codes: %', CASE WHEN record_count = column_count THEN 'YES' ELSE 'NO' END;
    
    -- Check the backup table
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'award_translations_backup'
    ) INTO result_text;
    
    RAISE NOTICE 'Backup table exists: %', result_text;
    
    IF result_text = 'true' THEN
        SELECT COUNT(*) INTO backup_count
        FROM public.award_translations_backup;
        
        RAISE NOTICE 'Backup records: %', backup_count;
    END IF;
    
    -- Check if the view exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.views
        WHERE table_schema = 'public'
          AND table_name = 'student_achievements_view'
    ) INTO view_exists;
    
    RAISE NOTICE 'Student achievements view exists: %', view_exists;
    
    -- Check if the achievement function was updated
    SELECT EXISTS (
        SELECT 1
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
          AND p.proname = 'check_and_award_achievements'
    ) INTO function_exists;
    
    RAISE NOTICE 'Achievement function exists: %', function_exists;
    
    IF function_exists THEN
        -- Check if function definition contains 'code' references
        -- This is a basic check but better than nothing
        SELECT EXISTS (
            SELECT 1
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public'
              AND p.proname = 'check_and_award_achievements'
              AND pg_get_functiondef(p.oid) LIKE '%code%'
        ) INTO result_text;
        
        RAISE NOTICE 'Achievement function uses code column: %', result_text;
    END IF;
    
    -- Final verification result
    IF column_count = record_count AND view_exists AND function_exists THEN
        RAISE NOTICE '-------------------------------------';
        RAISE NOTICE 'MIGRATION VERIFICATION: SUCCESSFUL';
        RAISE NOTICE '-------------------------------------';
    ELSE
        RAISE NOTICE '-------------------------------------';
        RAISE NOTICE 'MIGRATION VERIFICATION: INCOMPLETE';
        RAISE NOTICE '-------------------------------------';
        RAISE NOTICE 'Please check the above details to identify any missing steps.';
    END IF;
END $$;
