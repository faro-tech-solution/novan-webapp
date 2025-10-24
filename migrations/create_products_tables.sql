-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  thumbnail TEXT,
  product_type TEXT NOT NULL DEFAULT 'other' CHECK (product_type IN ('video', 'audio', 'ebook', 'other')),
  file_url TEXT,
  author TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  duration INTEGER, -- Duration in seconds for video/audio
  file_size BIGINT, -- File size in bytes
  price INTEGER DEFAULT 0, -- Price in cents (0 = free)
  access_level TEXT NOT NULL DEFAULT 'public' CHECK (access_level IN ('public', 'registered', 'paid')),
  is_featured BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_is_featured ON public.products(is_featured);
CREATE INDEX idx_products_access_level ON public.products(access_level);
CREATE INDEX idx_products_product_type ON public.products(product_type);
CREATE INDEX idx_products_created_by ON public.products(created_by);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products table
-- Public read access to active products
CREATE POLICY "Active products are viewable by everyone" ON public.products
  FOR SELECT USING (status = 'active');

-- Authenticated users can read registered/paid products (access control handled in application layer)
CREATE POLICY "Registered and paid products are viewable by authenticated users" ON public.products
  FOR SELECT USING (
    status = 'active' AND 
    (access_level = 'registered' OR access_level = 'paid') AND
    auth.uid() IS NOT NULL
  );

-- Only admins can insert products
CREATE POLICY "Only admins can create products" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update products
CREATE POLICY "Only admins can update products" ON public.products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete products
CREATE POLICY "Only admins can delete products" ON public.products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger for updated_at column
CREATE OR REPLACE FUNCTION update_products_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON public.products 
  FOR EACH ROW EXECUTE FUNCTION update_products_updated_at_column();

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(input_title TEXT)
RETURNS TEXT AS $$
DECLARE
    generated_slug TEXT;
    counter INTEGER := 0;
    base_slug TEXT;
BEGIN
    -- Convert to lowercase, replace spaces with hyphens, remove special characters
    base_slug := lower(regexp_replace(input_title, '[^a-zA-Z0-9\s]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    
    generated_slug := base_slug;
    
    -- Check if slug exists and append counter if needed
    WHILE EXISTS (SELECT 1 FROM public.products WHERE slug = generated_slug) LOOP
        counter := counter + 1;
        generated_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN generated_slug;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate slug on insert
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_slug(NEW.title);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_product_slug
  BEFORE INSERT ON public.products
  FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();

-- Sample seed data (optional - can be removed in production)
INSERT INTO public.products (
  title, 
  description, 
  product_type, 
  author, 
  category, 
  tags, 
  duration, 
  file_size, 
  price, 
  access_level, 
  is_featured, 
  status, 
  created_by
) VALUES
(
  'Introduction to React Development',
  '<p>Learn the fundamentals of React development with this comprehensive video course. Perfect for beginners who want to understand modern web development.</p>',
  'video',
  'John Doe',
  'Programming',
  ARRAY['react', 'javascript', 'frontend', 'web development'],
  3600,
  104857600,
  0,
  'public',
  true,
  'active',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Advanced JavaScript Patterns',
  '<p>Master advanced JavaScript patterns and techniques used in modern applications. This audio course covers closures, prototypes, and design patterns.</p>',
  'audio',
  'Jane Smith',
  'Programming',
  ARRAY['javascript', 'patterns', 'advanced', 'programming'],
  7200,
  52428800,
  2999,
  'registered',
  true,
  'active',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Complete Guide to TypeScript',
  '<p>A comprehensive ebook covering TypeScript from basics to advanced topics. Includes practical examples and best practices.</p>',
  'ebook',
  'Mike Johnson',
  'Programming',
  ARRAY['typescript', 'ebook', 'guide', 'programming'],
  NULL,
  20971520,
  1999,
  'paid',
  true,
  'active',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Web Design Fundamentals',
  '<p>Learn the principles of good web design with this practical guide. Covers color theory, typography, and layout design.</p>',
  'ebook',
  'Sarah Wilson',
  'Design',
  ARRAY['design', 'web design', 'ui', 'ux'],
  NULL,
  15728640,
  0,
  'public',
  false,
  'active',
  (SELECT id FROM auth.users LIMIT 1)
);
