-- Update exercise order_index when category order changes
-- =====================================================

-- Create function to recalculate exercise order_indexes when category order changes
CREATE OR REPLACE FUNCTION recalculate_exercise_order_indexes_on_category_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If category order_index changed, recalculate all exercises in that category
  IF TG_OP = 'UPDATE' AND OLD.order_index != NEW.order_index THEN
    UPDATE exercises 
    SET order_index = (
      SELECT 
        COALESCE(ec.order_index * 1000, 0) + 
        COALESCE(
          (SELECT COUNT(*) 
           FROM exercises e2 
           WHERE e2.category_id = exercises.category_id 
           AND e2.created_at <= exercises.created_at), 
          0
        )
      FROM exercise_categories ec
      WHERE ec.id = exercises.category_id
    )
    WHERE category_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on exercise_categories table
DROP TRIGGER IF EXISTS trigger_recalculate_exercise_order_on_category_change ON exercise_categories;
CREATE TRIGGER trigger_recalculate_exercise_order_on_category_change
  AFTER UPDATE ON exercise_categories
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_exercise_order_indexes_on_category_change();

-- Create function to recalculate all exercise order_indexes when categories are reordered
CREATE OR REPLACE FUNCTION recalculate_all_exercise_order_indexes_after_reorder()
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

-- Log the migration
DO $$
BEGIN
    RAISE NOTICE 'Exercise order_index recalculation triggers added successfully';
    RAISE NOTICE 'Exercises will now automatically update their order_index when category order changes';
END $$;
