-- Drop existing foreign key constraints
ALTER TABLE accounting
  DROP CONSTRAINT IF EXISTS accounting_user_id_fkey,
  DROP CONSTRAINT IF EXISTS accounting_course_id_fkey;

-- Add correct foreign key constraints
ALTER TABLE accounting
  ADD CONSTRAINT accounting_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE,
  ADD CONSTRAINT accounting_course_id_fkey
    FOREIGN KEY (course_id)
    REFERENCES courses(id)
    ON DELETE SET NULL;

-- Update RLS policies to use profiles table
DROP POLICY IF EXISTS "Admins can view all accounting records" ON accounting;
DROP POLICY IF EXISTS "Admins can insert accounting records" ON accounting;
DROP POLICY IF EXISTS "Admins can update accounting records" ON accounting;

-- Create new policies using profiles table
CREATE POLICY "Admins can view all accounting records"
    ON accounting FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert accounting records"
    ON accounting FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update accounting records"
    ON accounting FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Add policy for users to view their own records
CREATE POLICY "Users can view their own accounting records"
    ON accounting FOR SELECT
    TO authenticated
    USING (user_id = auth.uid()); 