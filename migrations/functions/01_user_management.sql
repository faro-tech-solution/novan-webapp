-- User Management Functions
-- ========================

-- Function to handle new user registration
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

-- Function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is trainer or admin
CREATE OR REPLACE FUNCTION is_trainer_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('trainer', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 