
import { supabase } from '@/integrations/supabase/client';
import { Course, PublicCourse } from '@/types/course';

export const fetchCourses = async (): Promise<Course[] | any[]> => {
  console.log('Fetching courses...');

  const { data, error } = await supabase
    .from('courses')
    .select('id, name, description, price, created_at, updated_at')
    .order('name');

  if (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }

  console.log('Fetched courses:', data);
  return data || [];
};

export const fetchPublicCourses = async (): Promise<PublicCourse[]> => {
  console.log('Fetching public courses...');

  const { data: coursesData, error } = await supabase
    .from('courses')
    .select(`
      id,
      name,
      description,
      price,
      created_at,
      updated_at
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching public courses:', error);
    throw error;
  }

  // Transform data to match PublicCourse interface
  const courses = (coursesData || []).map((course: any) => ({
    ...course,
    instructor_name: 'نامشخص', // Default since instructor info is not available
    status: 'active',
    slug: course.id, // Use ID as slug for now
    thumbnail: null,
    start_date: null,
    end_date: null,
    preview_data: null,
    max_students: null,
  }));

  console.log('Fetched public courses:', courses);
  return courses as PublicCourse[];
};

export const fetchCourseBySlug = async (slug: string): Promise<PublicCourse | null> => {
  console.log('Fetching course by slug:', slug);

  // For now, treat slug as ID since we don't have slug column in current schema
  const { data, error } = await supabase
    .from('courses')
    .select(`
      id,
      name,
      description,
      price,
      created_at,
      updated_at
    `)
    .eq('id', slug)
    .single();

  if (error) {
    console.error('Error fetching course by slug:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  // Transform data to match PublicCourse interface
  const course = {
    ...data,
    instructor_name: 'نامشخص',
    status: 'active',
    slug: data.id,
    thumbnail: null,
    start_date: null,
    end_date: null,
    preview_data: null,
    max_students: null,
  };

  console.log('Fetched course:', course);
  return course as PublicCourse;
};
