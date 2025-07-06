-- Create daily_activities table for global daily tasks
CREATE TABLE public.daily_activities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    points INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (optional, for future per-user assignment)
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view active daily activities
CREATE POLICY "Everyone can view daily activities" 
  ON public.daily_activities 
  FOR SELECT 
  USING (is_active = TRUE);

-- Index for fast lookup
CREATE INDEX idx_daily_activities_active ON public.daily_activities(is_active); 