-- Consolidated Profile Enhancements Migration
-- This migration consolidates all profile-related changes from multiple migrations

-- Split name fields and add new profile fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS linkedin TEXT,
ADD COLUMN IF NOT EXISTS github TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;

-- Update existing full_name data to split into first_name and last_name
UPDATE public.profiles 
SET 
    first_name = CASE 
        WHEN full_name IS NOT NULL AND position(' ' in full_name) > 0 
        THEN split_part(full_name, ' ', 1)
        ELSE full_name
    END,
    last_name = CASE 
        WHEN full_name IS NOT NULL AND position(' ' in full_name) > 0 
        THEN substring(full_name from position(' ' in full_name) + 1)
        ELSE NULL
    END
WHERE full_name IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.first_name IS 'User first name';
COMMENT ON COLUMN public.profiles.last_name IS 'User last name';
COMMENT ON COLUMN public.profiles.phone IS 'User phone number';
COMMENT ON COLUMN public.profiles.address IS 'User street address';
COMMENT ON COLUMN public.profiles.city IS 'User city';
COMMENT ON COLUMN public.profiles.country IS 'User country';
COMMENT ON COLUMN public.profiles.postal_code IS 'User postal code';
COMMENT ON COLUMN public.profiles.date_of_birth IS 'User date of birth';
COMMENT ON COLUMN public.profiles.gender IS 'User gender';
COMMENT ON COLUMN public.profiles.bio IS 'User biography';
COMMENT ON COLUMN public.profiles.website IS 'User website URL';
COMMENT ON COLUMN public.profiles.linkedin IS 'User LinkedIn profile URL';
COMMENT ON COLUMN public.profiles.github IS 'User GitHub profile URL';
COMMENT ON COLUMN public.profiles.twitter IS 'User Twitter profile URL';
COMMENT ON COLUMN public.profiles.is_demo IS 'Whether this is a demo account';
