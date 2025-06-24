-- Create wiki categories table
CREATE TABLE wiki_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  access_type VARCHAR(50) NOT NULL DEFAULT 'all_students', -- 'all_students', 'course_specific'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create wiki topics table
CREATE TABLE wiki_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES wiki_categories(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create wiki articles table
CREATE TABLE wiki_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES wiki_topics(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create wiki category course access table (for course-specific access)
CREATE TABLE wiki_category_course_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES wiki_categories(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, course_id)
);

-- Create indexes for better performance
CREATE INDEX idx_wiki_categories_access_type ON wiki_categories(access_type);
CREATE INDEX idx_wiki_topics_category_id ON wiki_topics(category_id);
CREATE INDEX idx_wiki_articles_topic_id ON wiki_articles(topic_id);
CREATE INDEX idx_wiki_articles_published ON wiki_articles(is_published);
CREATE INDEX idx_wiki_category_course_access_category ON wiki_category_course_access(category_id);
CREATE INDEX idx_wiki_category_course_access_course ON wiki_category_course_access(course_id);

-- Enable RLS
ALTER TABLE wiki_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_category_course_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wiki_categories
CREATE POLICY "Users can view all wiki categories" ON wiki_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage wiki categories" ON wiki_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for wiki_topics
CREATE POLICY "Users can view all wiki topics" ON wiki_topics
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage wiki topics" ON wiki_topics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for wiki_articles
CREATE POLICY "Users can view published wiki articles" ON wiki_articles
  FOR SELECT USING (is_published = true);

CREATE POLICY "Trainers and admins can manage wiki articles" ON wiki_articles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('trainer', 'admin')
    )
  );

-- RLS Policies for wiki_category_course_access
CREATE POLICY "Users can view wiki category course access" ON wiki_category_course_access
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage wiki category course access" ON wiki_category_course_access
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_wiki_categories_updated_at BEFORE UPDATE ON wiki_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wiki_topics_updated_at BEFORE UPDATE ON wiki_topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wiki_articles_updated_at BEFORE UPDATE ON wiki_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default categories
INSERT INTO wiki_categories (title, description, access_type) VALUES
  ('منبع پرامپت', 'منابع و راهنمای پرامپت نویسی', 'all_students'),
  ('منابع مفید برنامه نویسی', 'کتابخانه‌ها، ابزارها و منابع مفید برنامه نویسی', 'all_students'),
  ('راهنمای پروژه', 'راهنمای انجام پروژه‌های مختلف', 'course_specific'),
  ('سوالات متداول', 'پاسخ به سوالات رایج دانشجویان', 'all_students'); 