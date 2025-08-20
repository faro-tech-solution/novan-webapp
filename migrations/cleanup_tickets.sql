-- Ticket System Cleanup Script
-- This script removes all ticket-related functionality from the database

-- Drop ticket-related tables in the correct order (respecting foreign key constraints)

-- 1. Drop ticket_activity_logs table first (depends on tickets)
DROP TABLE IF EXISTS public.ticket_activity_logs CASCADE;

-- 2. Drop ticket_messages table (depends on tickets)
DROP TABLE IF EXISTS public.ticket_messages CASCADE;

-- 3. Drop tickets table (main table)
DROP TABLE IF EXISTS public.tickets CASCADE;

-- 4. Remove any ticket-related RLS policies (if they exist)
-- Note: These would be automatically dropped with the tables, but explicitly removing for clarity
DO $$
BEGIN
    -- Drop RLS policies for ticket tables (if they exist)
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.tickets';
    EXECUTE 'DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.tickets';
    EXECUTE 'DROP POLICY IF EXISTS "Enable update for ticket creators and assignees" ON public.tickets';
    EXECUTE 'DROP POLICY IF EXISTS "Enable delete for ticket creators" ON public.tickets';
    
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.ticket_messages';
    EXECUTE 'DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.ticket_messages';
    EXECUTE 'DROP POLICY IF EXISTS "Enable update for message senders" ON public.ticket_messages';
    EXECUTE 'DROP POLICY IF EXISTS "Enable delete for message senders" ON public.ticket_messages';
    
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.ticket_activity_logs';
    EXECUTE 'DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.ticket_activity_logs';
    EXECUTE 'DROP POLICY IF EXISTS "Enable update for activity loggers" ON public.ticket_activity_logs';
    EXECUTE 'DROP POLICY IF EXISTS "Enable delete for activity loggers" ON public.ticket_activity_logs';
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors if policies don't exist
        NULL;
END $$;

-- 5. Remove any ticket-related triggers (if they exist)
DO $$
BEGIN
    -- Drop triggers for ticket tables (if they exist)
    EXECUTE 'DROP TRIGGER IF EXISTS update_tickets_updated_at ON public.tickets';
    EXECUTE 'DROP TRIGGER IF EXISTS update_ticket_messages_updated_at ON public.ticket_messages';
    EXECUTE 'DROP TRIGGER IF EXISTS update_ticket_activity_logs_updated_at ON public.ticket_activity_logs';
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors if triggers don't exist
        NULL;
END $$;

-- 6. Remove any ticket-related functions (if they exist)
DO $$
BEGIN
    -- Drop functions related to tickets (if they exist)
    EXECUTE 'DROP FUNCTION IF EXISTS public.handle_ticket_creation() CASCADE';
    EXECUTE 'DROP FUNCTION IF EXISTS public.handle_ticket_update() CASCADE';
    EXECUTE 'DROP FUNCTION IF EXISTS public.handle_ticket_message_creation() CASCADE';
    EXECUTE 'DROP FUNCTION IF EXISTS public.handle_ticket_activity_log() CASCADE';
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors if functions don't exist
        NULL;
END $$;

-- 7. Clean up any remaining references
-- Remove any ticket-related storage buckets (if they exist)
-- Note: This would need to be done through Supabase dashboard or CLI
-- as storage operations are not available in regular SQL

-- 8. Verify cleanup
DO $$
BEGIN
    -- Check if any ticket-related tables still exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tickets') THEN
        RAISE EXCEPTION 'Tickets table still exists after cleanup';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ticket_messages') THEN
        RAISE EXCEPTION 'Ticket messages table still exists after cleanup';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ticket_activity_logs') THEN
        RAISE EXCEPTION 'Ticket activity logs table still exists after cleanup';
    END IF;
    
    RAISE NOTICE 'Ticket system cleanup completed successfully';
END $$;
