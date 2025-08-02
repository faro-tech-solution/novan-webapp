
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/types/course';

export const fetchCourses = async (): Promise<Course[]> => {
  console.log('Fetching courses...');

  const { data, error } = await supabase
    .from('courses')
    .select('id, name, instructor_id, status, slug, thumbnail')
    .order('name');

  if (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }

  console.log('Fetched courses:', data);
  return data || [];
};
