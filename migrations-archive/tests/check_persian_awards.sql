-- SQL script to check Persian awards in the database
-- This script will check if the Persian award names exist in the awards table

-- Check for تولد یک کدنویس (Birth of a Programmer)
SELECT id, name, description, points_value 
FROM awards 
WHERE name = 'تولد یک کدنویس' OR name = 'First Submission';

-- Check for استاد کامل (Perfect Score)
SELECT id, name, description, points_value 
FROM awards 
WHERE name = 'استاد کامل' OR name = 'Perfect Score';

-- Check for نابغه برنامه‌نویسی (High Achiever)
SELECT id, name, description, points_value 
FROM awards 
WHERE name = 'نابغه برنامه‌نویسی' OR name = 'High Achiever';

-- Check for تکمیل‌کننده زودهنگام (Early Bird)
SELECT id, name, description, points_value 
FROM awards 
WHERE name = 'تکمیل‌کننده زودهنگام' OR name = 'Early Bird';

-- Count all awards to make sure we have the expected number
SELECT COUNT(*) AS total_awards FROM awards;

-- List all award names to verify translations
SELECT name FROM awards ORDER BY name;
