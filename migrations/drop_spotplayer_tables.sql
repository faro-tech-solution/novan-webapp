-- Drop SpotPlayer related tables
-- This migration removes all SpotPlayer related tables from the database

BEGIN;

-- Drop SpotPlayer tables in the correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS public.spotplayer_stream_logs CASCADE;
DROP TABLE IF EXISTS public.spotplayer_licenses CASCADE;
DROP TABLE IF EXISTS public.spotplayer_cookies CASCADE;

COMMIT;

-- Log the migration
DO $$
BEGIN
    RAISE NOTICE 'Successfully dropped SpotPlayer tables: spotplayer_stream_logs, spotplayer_licenses, spotplayer_cookies';
END $$; 