-- Add order_index column to exercises table
ALTER TABLE exercises ADD COLUMN order_index INTEGER DEFAULT 0;

-- Update existing exercises to have sequential order_index
UPDATE exercises 
SET order_index = subquery.row_num 
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY course_id ORDER BY created_at) as row_num
  FROM exercises
) as subquery
WHERE exercises.id = subquery.id;

-- Make order_index NOT NULL after setting default values
ALTER TABLE exercises ALTER COLUMN order_index SET NOT NULL;

-- Create index for better performance on sorting
CREATE INDEX idx_exercises_order_index ON exercises(course_id, order_index);

-- Add comment to document the column
COMMENT ON COLUMN exercises.order_index IS 'Order index for sorting exercises within a course'; 