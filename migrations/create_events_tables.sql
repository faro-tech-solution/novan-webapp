-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  thumbnail TEXT,
  registration_link TEXT,
  video_url TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create event_presenters junction table
CREATE TABLE public.event_presenters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_created_by ON public.events(created_by);
CREATE INDEX idx_event_presenters_event_id ON public.event_presenters(event_id);
CREATE INDEX idx_event_presenters_user_id ON public.event_presenters(user_id);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_presenters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events table
-- Public read access to events
CREATE POLICY "Events are viewable by everyone" ON public.events
  FOR SELECT USING (true);

-- Only admins can insert events
CREATE POLICY "Only admins can create events" ON public.events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update events
CREATE POLICY "Only admins can update events" ON public.events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete events
CREATE POLICY "Only admins can delete events" ON public.events
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for event_presenters table
-- Authenticated users can read event presenters
CREATE POLICY "Event presenters are viewable by authenticated users" ON public.event_presenters
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins can manage event presenters
CREATE POLICY "Only admins can manage event presenters" ON public.event_presenters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger for updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON public.events 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample seed data (optional - can be removed in production)
INSERT INTO public.events (title, subtitle, description, start_date, status, created_by) VALUES
('Introduction to AI', 'Learn the basics of artificial intelligence and machine learning', '<p>This comprehensive workshop covers the fundamental concepts of artificial intelligence and machine learning. Perfect for beginners who want to understand how AI works and its applications in real-world scenarios.</p>', NOW() + INTERVAL '7 days', 'upcoming', (SELECT id FROM auth.users LIMIT 1)),
('Web Development Workshop', 'Hands-on workshop covering modern web development practices', '<p>Join us for an intensive hands-on workshop where you will learn modern web development techniques, frameworks, and best practices used in the industry today.</p>', NOW() + INTERVAL '14 days', 'upcoming', (SELECT id FROM auth.users LIMIT 1)),
('Data Science Fundamentals', 'Comprehensive introduction to data science and analytics', '<p>Discover the world of data science through this comprehensive course that covers data analysis, visualization, statistical modeling, and machine learning algorithms.</p>', NOW() + INTERVAL '21 days', 'upcoming', (SELECT id FROM auth.users LIMIT 1));
