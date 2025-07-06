-- ===============================================================
-- FIX VIEWS AND FUNCTIONS FOR NEW AWARD STRUCTURE
-- ===============================================================
-- This SQL script updates any views or functions that might
-- depend on the awards.name and awards.description columns
-- which have been removed in favor of client-side translations
--
-- Date: July 4, 2025
-- ===============================================================

-- First, check for any views that reference awards.name or awards.description
DO $$
DECLARE
  view_record RECORD;
  view_definition TEXT;
BEGIN
  FOR view_record IN 
    SELECT table_name 
    FROM information_schema.views 
    WHERE table_schema = 'public' 
  LOOP
    -- Get the view definition
    SELECT pg_get_viewdef(view_record.table_name::regclass, true) INTO view_definition;
    
    -- Check if the view references the removed columns
    IF view_definition LIKE '%awards.name%' OR view_definition LIKE '%awards.description%' THEN
      RAISE NOTICE 'View % may need to be updated to use award codes', view_record.table_name;
    END IF;
  END LOOP;
END $$;

-- Update any stored procedures that might reference the name and description
-- Note: We already updated check_and_award_achievements in the main migration

-- Create or replace a view for looking up student achievements with their codes
DROP VIEW IF EXISTS public.student_achievements_view;

CREATE VIEW public.student_achievements_view AS
SELECT 
  sa.id,
  sa.student_id,
  sa.award_id,
  a.code AS award_code,
  a.icon,
  a.points_value,
  a.rarity,
  a.category,
  sa.earned_at,
  sa.bonus_points
FROM 
  public.student_awards sa
JOIN 
  public.awards a ON sa.award_id = a.id;

-- Add documentation about removed columns
COMMENT ON TABLE public.awards IS 'Award definitions with code-based identifiers. Name and description have been removed in favor of client-side translations.';
COMMENT ON COLUMN public.awards.code IS 'Unique identifier for the award, used for translation lookups in the client application';
