-- Updated At Timestamp Triggers
-- =============================

-- Trigger for profiles table
DROP TRIGGER IF EXISTS set_updated_at ON profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Trigger for courses table
DROP TRIGGER IF EXISTS set_updated_at ON courses;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Trigger for exercises table
DROP TRIGGER IF EXISTS set_updated_at ON exercises;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Trigger for course_terms table
DROP TRIGGER IF EXISTS set_updated_at ON course_terms;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON course_terms
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Trigger for groups table
DROP TRIGGER IF EXISTS set_updated_at ON groups;
DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Trigger for wiki_categories table
DROP TRIGGER IF EXISTS set_updated_at ON wiki_categories;
DROP TRIGGER IF EXISTS update_wiki_categories_updated_at ON wiki_categories;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON wiki_categories
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Trigger for wiki_topics table
DROP TRIGGER IF EXISTS set_updated_at ON wiki_topics;
DROP TRIGGER IF EXISTS update_wiki_topics_updated_at ON wiki_topics;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON wiki_topics
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Trigger for wiki_articles table
DROP TRIGGER IF EXISTS set_updated_at ON wiki_articles;
DROP TRIGGER IF EXISTS update_wiki_articles_updated_at ON wiki_articles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON wiki_articles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Trigger for course_enrollments table
DROP TRIGGER IF EXISTS set_course_enrollments_updated_at ON course_enrollments;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Trigger for accounting table
DROP TRIGGER IF EXISTS set_accounting_updated_at ON accounting;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON accounting
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at(); 