
import { supabase } from '@/integrations/supabase/client';
import { Course, PublicCourse } from '@/types/course';

export const fetchCourses = async (): Promise<Course[] | any[]> => {
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

export const fetchPublicCourses = async (): Promise<PublicCourse[]> => {
  console.log('Fetching public courses...');

  const { data: coursesData, error } = await supabase
    .from('courses')
    .select(`
      id,
      name,
      description,
      instructor_id,
      status,
      slug,
      thumbnail,
      price,
      start_date,
      end_date,
      preview_data,
      max_students,
      created_at
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching public courses:', error);
    throw error;
  }

  // Fetch instructor profiles separately
  const instructorIds = [...new Set((coursesData || []).map(c => c.instructor_id))];
  const { data: instructors } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .in('id', instructorIds);

  // Create a map of instructor data
  const instructorMap = new Map(
    (instructors || []).map(inst => [
      inst.id,
      `${inst.first_name} ${inst.last_name}`
    ])
  );

  // Transform data to include instructor_name
  const courses = (coursesData || []).map((course: any) => ({
    ...course,
    instructor_name: instructorMap.get(course.instructor_id) || 'نامشخص',
  }));

  console.log('Fetched public courses:', courses);
  return courses as PublicCourse[];
};

export const fetchCourseBySlug = async (slug: string): Promise<PublicCourse | null> => {
  console.log('Fetching course by slug:', slug);

  const { data, error } = await supabase
    .from('courses')
    .select(`
      id,
      name,
      description,
      instructor_id,
      status,
      slug,
      thumbnail,
      price,
      start_date,
      end_date,
      preview_data,
      max_students,
      created_at
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (error) {
    console.error('Error fetching course by slug:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  // Fetch instructor profile separately
  let instructorName = 'نامشخص';
  if (data.instructor_id) {
    const { data: instructor } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', data.instructor_id)
      .single();

    if (instructor) {
      instructorName = `${instructor.first_name} ${instructor.last_name}`;
    }
  }

  // Transform data to include instructor_name
  const course = {
    ...data,
    instructor_name: instructorName,
  };

  console.log('Fetched course:', course);
  return course as PublicCourse;
};
