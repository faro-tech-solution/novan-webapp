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

async function testCategorySave() {
  try {
    console.log('Testing category_id save functionality...');

    // Get the first course
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

    // Get the first user
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

    // Create a test category
    const { data: category, error: categoryError } = await supabase
      .from('exercise_categories')
      .insert({
        name: 'Test Category for Exercise',
        description: 'Test category for exercise creation',
        course_id: course.id,
        order_index: 0,
        is_active: true,
        created_by: userId
      })
      .select()
      .single();

    if (categoryError) {
      if (categoryError.code === '23505') {
        console.log('Category already exists, using existing one...');
        // Get existing category
        const { data: existingCategory } = await supabase
          .from('exercise_categories')
          .select('*')
          .eq('name', 'Test Category for Exercise')
          .eq('course_id', course.id)
          .single();
        
        if (existingCategory) {
          category = existingCategory;
        }
      } else {
        throw new Error(`Error creating category: ${categoryError.message}`);
      }
    }

    if (!category) {
      console.log('Could not create or find test category');
      return;
    }

    console.log(`Using category: ${category.name} (ID: ${category.id})`);

    // Create a test exercise with category_id
    const testExercise = {
      title: 'Test Exercise with Category',
      description: 'This is a test exercise to verify category_id is saved',
      course_id: course.id,
      category_id: category.id, // This is the key field we're testing
      difficulty: 'آسان',
      points: 100,
      estimated_time: '30 دقیقه',
      exercise_type: 'form',
      auto_grade: false,
      form_structure: JSON.stringify({ questions: [] }),
      created_by: userId
    };

    console.log('Creating test exercise with category_id:', testExercise.category_id);

    const { data: exercise, error: exerciseError } = await supabase
      .from('exercises')
      .insert(testExercise)
      .select()
      .single();

    if (exerciseError) {
      throw new Error(`Error creating exercise: ${exerciseError.message}`);
    }

    console.log('✅ Test exercise created successfully!');
    console.log('Exercise details:');
    console.log(`- ID: ${exercise.id}`);
    console.log(`- Title: ${exercise.title}`);
    console.log(`- Category ID: ${exercise.category_id}`);
    console.log(`- Course ID: ${exercise.course_id}`);

    // Verify the category_id was saved correctly
    if (exercise.category_id === category.id) {
      console.log('✅ category_id was saved correctly!');
    } else {
      console.log('❌ category_id was not saved correctly!');
      console.log(`Expected: ${category.id}, Got: ${exercise.category_id}`);
    }

    // Clean up - delete the test exercise
    const { error: deleteError } = await supabase
      .from('exercises')
      .delete()
      .eq('id', exercise.id);

    if (deleteError) {
      console.log('Warning: Could not delete test exercise:', deleteError.message);
    } else {
      console.log('Test exercise cleaned up successfully');
    }

  } catch (error) {
    console.error('❌ Error testing category save:', error.message);
  }
}

testCategorySave(); 