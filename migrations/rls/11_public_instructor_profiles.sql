-- Allow public access to instructor profile information for course listings
-- This enables non-authenticated users to view instructor names on public course pages

-- Drop existing public access policy if it exists
DROP POLICY IF EXISTS "Public can view instructor profiles" ON profiles;

-- Create policy to allow public (anonymous) users to read instructor information
-- Only allows access to profiles with role 'trainer' or 'admin' (potential instructors)
CREATE POLICY "Public can view instructor profiles" ON profiles
FOR SELECT USING (
  -- Allow everyone (including anonymous users) to read trainer/admin profiles
  -- This is needed for public course pages to display instructor names
  role IN ('trainer', 'admin')
);

-- Note: This policy allows public read access to trainer and admin profiles only.
-- Application code should select only necessary columns (first_name, last_name)
-- to minimize data exposure. RLS policies control row-level access, not column-level access.

