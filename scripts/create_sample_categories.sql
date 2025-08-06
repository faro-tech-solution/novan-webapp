-- Create sample exercise categories for testing
-- ==============================================

-- First, let's see what courses exist
SELECT id, name FROM courses LIMIT 5;

-- Insert sample categories for the first course (if any exists)
INSERT INTO exercise_categories (
    name,
    description,
    course_id,
    order_index,
    is_active,
    created_by
) 
SELECT 
    'تمرینات پایه',
    'تمرینات مقدماتی برای شروع دوره',
    c.id,
    0,
    true,
    c.created_by
FROM courses c 
WHERE c.id = (
    SELECT id FROM courses LIMIT 1
)
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO exercise_categories (
    name,
    description,
    course_id,
    order_index,
    is_active,
    created_by
) 
SELECT 
    'تمرینات پیشرفته',
    'تمرینات پیشرفته برای دانشجویان سطح بالا',
    c.id,
    1,
    true,
    c.created_by
FROM courses c 
WHERE c.id = (
    SELECT id FROM courses LIMIT 1
)
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO exercise_categories (
    name,
    description,
    course_id,
    order_index,
    is_active,
    created_by
) 
SELECT 
    'تمرینات عملی',
    'تمرینات عملی و پروژه‌های کاربردی',
    c.id,
    2,
    true,
    c.created_by
FROM courses c 
WHERE c.id = (
    SELECT id FROM courses LIMIT 1
)
ON CONFLICT (course_id, name) DO NOTHING;

-- Check if categories were created
SELECT 
    id,
    name,
    description,
    course_id,
    order_index,
    is_active
FROM exercise_categories 
ORDER BY course_id, order_index; 