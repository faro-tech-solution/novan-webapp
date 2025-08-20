-- Manual Migration: Add order_index to exercises table
-- Run this script in your Supabase SQL Editor

-- Step 1: Add order_index column if it doesn't exist
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Step 2: Create function to calculate order_index
CREATE OR REPLACE FUNCTION calculate_exercise_order_index()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a new exercise or category_id changed
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.category_id IS DISTINCT FROM NEW.category_id) THEN
    -- Calculate order_index based on category order and exercise order within category
    SELECT 
      COALESCE(ec.order_index * 1000, 0) + 
      COALESCE(
        (SELECT COUNT(*) 
         FROM exercises e2 
         WHERE e2.category_id = NEW.category_id 
         AND e2.id != NEW.id
         AND e2.created_at <= NEW.created_at), 
        0
      )
    INTO NEW.order_index
    FROM exercise_categories ec
    WHERE ec.id = NEW.category_id;
    
    -- If no category, use a high number (999999) to put uncategorized exercises at the end
    IF NEW.category_id IS NULL THEN
      NEW.order_index = 999999 + COALESCE(
        (SELECT COUNT(*) 
         FROM exercises e2 
         WHERE e2.category_id IS NULL 
         AND e2.id != NEW.id
         AND e2.created_at <= NEW.created_at), 
        0
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create trigger to automatically calculate order_index
DROP TRIGGER IF EXISTS trigger_calculate_exercise_order_index ON exercises;
CREATE TRIGGER trigger_calculate_exercise_order_index
  BEFORE INSERT OR UPDATE ON exercises
  FOR EACH ROW
  EXECUTE FUNCTION calculate_exercise_order_index();

-- Step 4: Create function to recalculate all order_indexes
CREATE OR REPLACE FUNCTION recalculate_all_exercise_order_indexes()
RETURNS void AS $$
DECLARE
  exercise_record RECORD;
BEGIN
  -- Update all exercises with new order_index calculation
  FOR exercise_record IN 
    SELECT e.id, e.category_id, e.created_at
    FROM exercises e
    LEFT JOIN exercise_categories ec ON ec.id = e.category_id
    ORDER BY 
      COALESCE(ec.order_index, 999999),
      e.created_at
  LOOP
    UPDATE exercises 
    SET order_index = (
      SELECT 
        COALESCE(ec.order_index * 1000, 0) + 
        COALESCE(
          (SELECT COUNT(*) 
           FROM exercises e2 
           WHERE e2.category_id = exercise_record.category_id 
           AND e2.created_at <= exercise_record.created_at), 
          0
        )
      FROM exercise_categories ec
      WHERE ec.id = exercise_record.category_id
    )
    WHERE id = exercise_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Update existing exercises to have calculated order_index
SELECT recalculate_all_exercise_order_indexes();

-- Step 6: Make order_index NOT NULL after setting default values
ALTER TABLE exercises ALTER COLUMN order_index SET NOT NULL;

-- Step 7: Create index for better performance on sorting
CREATE INDEX IF NOT EXISTS idx_exercises_order_index ON exercises(course_id, order_index);

-- Step 8: Add comment to document the column
COMMENT ON COLUMN exercises.order_index IS 'Order index for sorting exercises within a course, calculated as (category_order * 1000) + exercise_order_in_category (0-based, display adds +1)';

-- Step 9: Verify the migration
SELECT 
  'Migration completed successfully!' as status,
  COUNT(*) as total_exercises,
  COUNT(CASE WHEN order_index IS NOT NULL THEN 1 END) as exercises_with_order_index
FROM exercises;
