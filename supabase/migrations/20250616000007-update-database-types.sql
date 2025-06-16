-- Update database types to include accounting table
ALTER TYPE public.tables ADD VALUE 'accounting';

-- Update database types to include accounting functions
ALTER TYPE public.functions ADD VALUE 'get_user_balance'; 