-- Recalculate all exercise order_indexes to fix any existing incorrect values
-- ==========================================================================
--
-- This script recalculates all exercise order_indexes to ensure they follow
-- the correct formula: (category_order * 1000) + exercise_order_in_category
--
-- Use this if you have existing exercises with incorrect order_indexes.

-- Create a temporary function to recalculate all exercises
CREATE OR REPLACE FUNCTION fix_all_exercise_order_indexes()
RETURNS void AS $$
DECLARE
  exercise_record RECORD;
  category_order_val INTEGER;
  exercise_counter INTEGER;
BEGIN
  -- Process each category in order
  FOR exercise_record IN 
    SELECT DISTINCT ec.id as category_id, ec.order_index as category_order
    FROM exercise_categories ec
    WHERE EXISTS (SELECT 1 FROM exercises e WHERE e.category_id = ec.id)
    ORDER BY ec.order_index
  LOOP
    category_order_val := exercise_record.category_order;
    exercise_counter := 0;
    
    -- Update all exercises in this category
    FOR exercise_record IN 
      SELECT e.id, e.order_index
      FROM exercises e
      WHERE e.category_id = exercise_record.category_id
      ORDER BY e.order_index  -- Preserve existing relative order
    LOOP
      UPDATE exercises 
      SET order_index = (category_order_val * 1000) + exercise_counter
      WHERE id = exercise_record.id;
      
      exercise_counter := exercise_counter + 1;
    END LOOP;
  END LOOP;
  
  -- Handle uncategorized exercises
  exercise_counter := 0;
  FOR exercise_record IN 
    SELECT e.id, e.order_index
    FROM exercises e
    WHERE e.category_id IS NULL
    ORDER BY e.order_index  -- Preserve existing relative order
  LOOP
    UPDATE exercises 
    SET order_index = 999999 + exercise_counter
    WHERE id = exercise_record.id;
    
    exercise_counter := exercise_counter + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the fix
SELECT fix_all_exercise_order_indexes();

-- Clean up the temporary function
DROP FUNCTION fix_all_exercise_order_indexes();

-- Log the completion
DO $$
BEGIN
    RAISE NOTICE 'All exercise order_indexes have been recalculated successfully';
    RAISE NOTICE 'Exercises now follow the correct formula: (category_order * 1000) + exercise_order_in_category';
END $$;
