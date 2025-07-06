-- Apply Functions and Triggers Migration
-- =====================================
-- This migration applies all functions and triggers in the correct order
-- to ensure the database is properly configured

-- Step 1: Apply all functions first
\i migrations/functions/00_all_functions.sql

-- Step 2: Apply all triggers (depends on functions being created)
\i migrations/triggers/00_all_triggers.sql

-- Migration complete!
-- All functions and triggers are now properly configured. 