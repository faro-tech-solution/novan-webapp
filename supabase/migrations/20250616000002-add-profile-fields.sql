-- Add new profile fields
ALTER TABLE public.profiles
ADD COLUMN gender text,
ADD COLUMN job text,
ADD COLUMN education text,
ADD COLUMN phone_number text,
ADD COLUMN country text,
ADD COLUMN city text,
ADD COLUMN birthday date,
ADD COLUMN ai_familiarity text CHECK (ai_familiarity IN ('beginner', 'intermediate', 'advanced', 'expert')),
ADD COLUMN english_level text CHECK (english_level IN ('beginner', 'intermediate', 'advanced', 'native')),
ADD COLUMN telegram_id text,
ADD COLUMN whatsapp_id text;

-- Update handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    email,
    role,
    gender,
    job,
    education,
    phone_number,
    country,
    city,
    birthday,
    ai_familiarity,
    english_level,
    telegram_id,
    whatsapp_id
  )
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'role', 'trainee'),
    new.raw_user_meta_data ->> 'gender',
    new.raw_user_meta_data ->> 'job',
    new.raw_user_meta_data ->> 'education',
    new.raw_user_meta_data ->> 'phone_number',
    new.raw_user_meta_data ->> 'country',
    new.raw_user_meta_data ->> 'city',
    (new.raw_user_meta_data ->> 'birthday')::date,
    new.raw_user_meta_data ->> 'ai_familiarity',
    new.raw_user_meta_data ->> 'english_level',
    new.raw_user_meta_data ->> 'telegram_id',
    new.raw_user_meta_data ->> 'whatsapp_id'
  );
  RETURN new;
END;
$$; 