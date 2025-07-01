-- Allow only admin users to insert daily activities
CREATE POLICY "Admins can insert daily activities"
  ON public.daily_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow only admin users to update daily activities
CREATE POLICY "Admins can update daily activities"
  ON public.daily_activities
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow only admin users to delete daily activities
CREATE POLICY "Admins can delete daily activities"
  ON public.daily_activities
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  ); 