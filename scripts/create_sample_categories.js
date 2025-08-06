const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or key not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSampleCategories() {
  try {
    console.log('Creating sample exercise categories...');

    // First, get the first available course
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, name')
      .limit(1);

    if (coursesError) {
      throw new Error(`Error fetching courses: ${coursesError.message}`);
    }

    if (!courses || courses.length === 0) {
      console.log('No courses found. Please create a course first.');
      return;
    }

    const course = courses[0];
    console.log(`Using course: ${course.name} (ID: ${course.id})`);

    // Get the first user to use as created_by
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (usersError) {
      throw new Error(`Error fetching users: ${usersError.message}`);
    }

    if (!users || users.length === 0) {
      console.log('No users found. Please create a user first.');
      return;
    }

    const userId = users[0].id;

    // Sample categories to create
    const sampleCategories = [
      {
        name: 'تمرینات پایه',
        description: 'تمرینات مقدماتی برای شروع دوره',
        course_id: course.id,
        order_index: 0,
        is_active: true,
        created_by: userId
      },
      {
        name: 'تمرینات پیشرفته',
        description: 'تمرینات پیشرفته برای دانشجویان سطح بالا',
        course_id: course.id,
        order_index: 1,
        is_active: true,
        created_by: userId
      },
      {
        name: 'تمرینات عملی',
        description: 'تمرینات عملی و پروژه‌های کاربردی',
        course_id: course.id,
        order_index: 2,
        is_active: true,
        created_by: userId
      }
    ];

    // Insert categories
    const { data: insertedCategories, error: insertError } = await supabase
      .from('exercise_categories')
      .insert(sampleCategories)
      .select('*');

    if (insertError) {
      if (insertError.code === '23505') {
        console.log('Categories already exist for this course.');
      } else {
        throw new Error(`Error inserting categories: ${insertError.message}`);
      }
    } else {
      console.log('✅ Sample exercise categories created successfully!');
      console.log('Created categories:');
      insertedCategories.forEach(category => {
        console.log(`- ${category.name} (ID: ${category.id})`);
      });
    }

    // Verify categories exist
    const { data: existingCategories, error: fetchError } = await supabase
      .from('exercise_categories')
      .select('*')
      .eq('course_id', course.id)
      .order('order_index');

    if (fetchError) {
      throw new Error(`Error fetching categories: ${fetchError.message}`);
    }

    console.log(`\nTotal categories for course: ${existingCategories.length}`);
    existingCategories.forEach(category => {
      console.log(`- ${category.name} (${category.exercise_count || 0} exercises)`);
    });

  } catch (error) {
    console.error('❌ Error creating sample categories:', error.message);
    process.exit(1);
  }
}

createSampleCategories(); 