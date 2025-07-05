-- Add price field to courses table
ALTER TABLE public.courses
ADD COLUMN price decimal(10,2) NOT NULL DEFAULT 0.00;

-- Add comment to explain the price field
COMMENT ON COLUMN public.courses.price IS 'Price of the course in the default currency'; 