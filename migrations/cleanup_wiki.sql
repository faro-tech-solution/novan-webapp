-- Cleanup Wiki System
-- This script removes all wiki-related tables and data

-- Drop wiki-related tables in the correct order (due to foreign key constraints)
DROP TABLE IF EXISTS wiki_category_course_access CASCADE;
DROP TABLE IF EXISTS wiki_articles CASCADE;
DROP TABLE IF EXISTS wiki_topics CASCADE;
DROP TABLE IF EXISTS wiki_categories CASCADE;

-- Remove any wiki-related RLS policies (if they still exist)
DROP POLICY IF EXISTS "Trainers and admins can manage wiki articles" ON wiki_articles;
DROP POLICY IF EXISTS "Users can view published wiki articles" ON wiki_articles;
DROP POLICY IF EXISTS "Admins can manage wiki categories" ON wiki_categories;
DROP POLICY IF EXISTS "Users can view all wiki categories" ON wiki_categories;
DROP POLICY IF EXISTS "Admins can manage wiki category course access" ON wiki_category_course_access;
DROP POLICY IF EXISTS "Users can view wiki category course access" ON wiki_category_course_access;
DROP POLICY IF EXISTS "Admins can manage wiki topics" ON wiki_topics;
DROP POLICY IF EXISTS "Users can view all wiki topics" ON wiki_topics;

-- Remove any wiki-related triggers (if they exist)
DROP TRIGGER IF EXISTS set_updated_at ON wiki_categories;
DROP TRIGGER IF EXISTS update_wiki_categories_updated_at ON wiki_categories;
DROP TRIGGER IF EXISTS set_updated_at ON wiki_topics;
DROP TRIGGER IF EXISTS update_wiki_topics_updated_at ON wiki_topics;
DROP TRIGGER IF EXISTS set_updated_at ON wiki_articles;
DROP TRIGGER IF EXISTS update_wiki_articles_updated_at ON wiki_articles;

-- Remove any wiki-related functions (if they exist)
DROP FUNCTION IF EXISTS get_wiki_stats() CASCADE;
DROP FUNCTION IF EXISTS get_wiki_category_with_topics(UUID) CASCADE;

-- Note: This script should be run carefully as it permanently removes all wiki data
-- Make sure to backup any important data before running this script 