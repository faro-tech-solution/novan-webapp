-- Create reported_issues table
CREATE TABLE IF NOT EXISTS public.reported_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX idx_reported_issues_user_id ON public.reported_issues(user_id);
CREATE INDEX idx_reported_issues_status ON public.reported_issues(status);
CREATE INDEX idx_reported_issues_created_at ON public.reported_issues(created_at DESC);

-- Enable RLS
ALTER TABLE public.reported_issues ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reported_issues table
-- Users can view their own reported issues
CREATE POLICY "Users can view their own reported issues" ON public.reported_issues
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own reported issues
CREATE POLICY "Users can create reported issues" ON public.reported_issues
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all reported issues
CREATE POLICY "Admins can view all reported issues" ON public.reported_issues
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all reported issues
CREATE POLICY "Admins can update all reported issues" ON public.reported_issues
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reported_issues_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF NEW.status IN ('resolved', 'closed') AND OLD.status NOT IN ('resolved', 'closed') THEN
    NEW.resolved_at = NOW();
    NEW.resolved_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reported_issues_updated_at
  BEFORE UPDATE ON public.reported_issues
  FOR EACH ROW
  EXECUTE FUNCTION update_reported_issues_updated_at();
