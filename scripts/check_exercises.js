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

async function checkExercises() {
  try {
    console.log('Checking existing exercises...');

    // Get all exercises with their category information
    const { data: exercises, error } = await supabase
      .from('exercises')
      .select(`
        id,
        title,
        course_id,
        category_id,
        created_at,
        courses (
          name
        ),
        exercise_categories (
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw new Error(`Error fetching exercises: ${error.message}`);
    }

    console.log(`Found ${exercises.length} exercises:`);
    exercises.forEach((exercise, index) => {
      console.log(`${index + 1}. ${exercise.title}`);
      console.log(`   - ID: ${exercise.id}`);
      console.log(`   - Course: ${exercise.courses?.name || 'Unknown'}`);
      console.log(`   - Category ID: ${exercise.category_id || 'null'}`);
      console.log(`   - Category Name: ${exercise.exercise_categories?.name || 'No category'}`);
      console.log('');
    });

    // Check categories
    console.log('Checking categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('exercise_categories')
      .select('*')
      .limit(5);

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError.message);
    } else {
      console.log(`Found ${categories.length} categories:`);
      categories.forEach((category, index) => {
        console.log(`${index + 1}. ${category.name} (ID: ${category.id})`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking exercises:', error.message);
  }
}

checkExercises(); 