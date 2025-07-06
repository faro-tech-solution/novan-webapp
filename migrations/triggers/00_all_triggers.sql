-- All Database Triggers
-- ====================
-- This file contains all triggers organized by category
-- Apply this file to ensure all triggers are properly set up

-- User Management Triggers
-- ========================

-- Trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Achievement System Triggers
-- ===========================

-- Trigger to check achievements after exercise submission
DROP TRIGGER IF EXISTS after_exercise_submission ON public.exercise_submissions;
DROP TRIGGER IF EXISTS trigger_check_achievements_after_submission ON exercise_submissions;
CREATE TRIGGER trigger_check_achievements_after_submission
  AFTER INSERT ON exercise_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_check_achievements();

-- Notification System Triggers
-- ============================

-- Trigger to create notification when exercise feedback is updated
DROP TRIGGER IF EXISTS on_feedback_updated ON exercise_submissions;
DROP TRIGGER IF EXISTS trigger_feedback_notification ON exercise_submissions;
CREATE TRIGGER trigger_feedback_notification
  AFTER UPDATE ON exercise_submissions
  FOR EACH ROW
  EXECUTE FUNCTION create_feedback_notification();

-- Trigger to create notification when award is achieved
DROP TRIGGER IF EXISTS on_award_achieved ON student_awards;
DROP TRIGGER IF EXISTS trigger_award_notification ON student_awards;
CREATE TRIGGER trigger_award_notification
  AFTER INSERT ON student_awards
  FOR EACH ROW
  EXECUTE FUNCTION create_award_notification();

-- Accounting System Triggers
-- ==========================

-- Trigger to handle course purchase accounting
DROP TRIGGER IF EXISTS on_course_purchase ON course_enrollments;
DROP TRIGGER IF EXISTS on_course_enrollment_payment ON course_enrollments;
DROP TRIGGER IF EXISTS course_payment_trigger ON course_enrollments;
DROP TRIGGER IF EXISTS handle_enrollment_payment ON course_enrollments;
DROP TRIGGER IF EXISTS process_course_payment ON course_enrollments;
DROP TRIGGER IF EXISTS course_enrollment_payment_trigger ON course_enrollments;
DROP TRIGGER IF EXISTS trigger_course_purchase ON course_enrollments;
CREATE TRIGGER trigger_course_purchase
  AFTER INSERT ON course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION handle_course_purchase();

-- Activity Logging Triggers
-- =========================

-- Trigger to log exercise submission activity
DROP TRIGGER IF EXISTS trigger_exercise_submission_activity ON exercise_submissions;
CREATE TRIGGER trigger_exercise_submission_activity
  AFTER INSERT ON exercise_submissions
  FOR EACH ROW
  EXECUTE FUNCTION handle_exercise_submission_activity();

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