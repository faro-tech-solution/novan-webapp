-- Fix exercise order calculation bug when category order changes
-- ============================================================
-- 
-- PROBLEM: When category order changes, exercises within that category
-- are recalculated based on created_at timestamp instead of preserving
-- their existing relative order within the category.
--
-- This causes exercises in category 4 to start with order_index 1, 2, 3...
-- instead of 4001, 4002, 4003... as expected.
--
-- SOLUTION: Preserve the existing exercise order within category by
-- using the current order_index % 1000 to maintain relative positions.

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS trigger_recalculate_exercise_order_on_category_change ON exercise_categories;
DROP FUNCTION IF EXISTS recalculate_exercise_order_indexes_on_category_change();

-- Create the corrected function
CREATE OR REPLACE FUNCTION recalculate_exercise_order_indexes_on_category_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If category order_index changed, recalculate all exercises in that category
  IF TG_OP = 'UPDATE' AND OLD.order_index != NEW.order_index THEN
    UPDATE exercises 
    SET order_index = (
      SELECT 
        COALESCE(ec.order_index * 1000, 0) + 
        -- Preserve the existing exercise order within category by using current order_index % 1000
        (exercises.order_index % 1000)
      FROM exercise_categories ec
      WHERE ec.id = exercises.category_id
    )
    WHERE category_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trigger_recalculate_exercise_order_on_category_change
  AFTER UPDATE ON exercise_categories
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_exercise_order_indexes_on_category_change();

-- Also fix the recalculate_all_exercise_order_indexes_after_reorder function
-- to preserve relative order within categories
DROP FUNCTION IF EXISTS recalculate_all_exercise_order_indexes_after_reorder();

CREATE OR REPLACE FUNCTION recalculate_all_exercise_order_indexes_after_reorder()
RETURNS void AS $$
DECLARE
  exercise_record RECORD;
BEGIN
  -- Update all exercises with new order_index calculation
  -- while preserving their relative order within each category
  FOR exercise_record IN 
    SELECT e.id, e.category_id, e.order_index
    FROM exercises e
    LEFT JOIN exercise_categories ec ON ec.id = e.category_id
    ORDER BY 
      COALESCE(ec.order_index, 999999),
      e.order_index  -- Use existing order_index to preserve relative order
  LOOP
    UPDATE exercises 
    SET order_index = (
      SELECT 
        COALESCE(ec.order_index * 1000, 0) + 
        -- Preserve the existing exercise order within category
        (exercise_record.order_index % 1000)
      FROM exercise_categories ec
      WHERE ec.id = exercise_record.category_id
    )
    WHERE id = exercise_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Log the fix
DO $$
BEGIN
    RAISE NOTICE 'Exercise order calculation bug fixed successfully';
    RAISE NOTICE 'Exercises will now preserve their relative order within categories when category order changes';
    RAISE NOTICE 'Category 4 exercises will now correctly start with order_index 4001, 4002, etc.';
END $$;
