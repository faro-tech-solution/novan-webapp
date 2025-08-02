-- 04_wiki_rls.sql
-- Consolidated RLS policies for Wiki system
-- Tables: wiki_articles, wiki_categories, wiki_category_course_access, wiki_topics

-- ========================================
-- WIKI_ARTICLES TABLE RLS POLICIES
-- ========================================
ALTER TABLE wiki_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Trainers and admins can manage wiki articles" ON wiki_articles;
DROP POLICY IF EXISTS "Users can view published wiki articles" ON wiki_articles;

-- Trainers and admins can manage wiki articles
CREATE POLICY "Trainers and admins can manage wiki articles" ON wiki_articles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.role = 'trainer')
  )
);

-- Users can view published wiki articles
CREATE POLICY "Users can view published wiki articles" ON wiki_articles
FOR SELECT USING (
  is_published = TRUE OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.role = 'trainer')
  )
);

-- ========================================
-- WIKI_CATEGORIES TABLE RLS POLICIES
-- ========================================
ALTER TABLE wiki_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage wiki categories" ON wiki_categories;
DROP POLICY IF EXISTS "Users can view all wiki categories" ON wiki_categories;

-- Admins can manage wiki categories
CREATE POLICY "Admins can manage wiki categories" ON wiki_categories
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Users can view all wiki categories
CREATE POLICY "Users can view all wiki categories" ON wiki_categories
FOR SELECT USING (
  TRUE
);

-- ========================================
-- WIKI_CATEGORY_COURSE_ACCESS TABLE RLS POLICIES
-- ========================================
ALTER TABLE wiki_category_course_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage wiki category course access" ON wiki_category_course_access;
DROP POLICY IF EXISTS "Users can view wiki category course access" ON wiki_category_course_access;

-- Admins can manage wiki category course access
CREATE POLICY "Admins can manage wiki category course access" ON wiki_category_course_access
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Users can view wiki category course access
CREATE POLICY "Users can view wiki category course access" ON wiki_category_course_access
FOR SELECT USING (
  TRUE
);

-- ========================================
-- WIKI_TOPICS TABLE RLS POLICIES
-- ========================================
ALTER TABLE wiki_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage wiki topics" ON wiki_topics;
DROP POLICY IF EXISTS "Users can view all wiki topics" ON wiki_topics;

-- Admins can manage wiki topics
CREATE POLICY "Admins can manage wiki topics" ON wiki_topics
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Users can view all wiki topics
CREATE POLICY "Users can view all wiki topics" ON wiki_topics
FOR SELECT USING (
  TRUE
); 