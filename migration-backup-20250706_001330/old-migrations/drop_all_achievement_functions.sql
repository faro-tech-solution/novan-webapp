-- Script to forcefully drop all achievement-related functions and triggers with CASCADE
-- This script ensures all dependencies are properly removed before recreating them
-- WARNING: This will remove all triggers and functions related to achievements

-- Drop the trigger first
DROP TRIGGER IF EXISTS after_exercise_submission ON public.exercise_submissions;

-- Drop all functions with CASCADE to ensure all dependencies are removed
DROP FUNCTION IF EXISTS public.trigger_check_achievements() CASCADE;
DROP FUNCTION IF EXISTS public.check_and_award_achievements(UUID) CASCADE;

-- Output confirmation message
DO $$
BEGIN
  RAISE NOTICE 'All achievement-related functions and triggers have been dropped';
END $$;
