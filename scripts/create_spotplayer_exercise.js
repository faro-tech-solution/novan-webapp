const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSpotPlayerExercise() {
  try {
    console.log('Creating SpotPlayer exercise...');
    
    // First, let's check if we have any courses to work with
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, name')
      .limit(5);

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return;
    }

    if (!courses || courses.length === 0) {
      console.log('No courses found. Please create a course first.');
      return;
    }

    console.log('Available courses:');
    courses.forEach((course, index) => {
      console.log(`  ${index + 1}. ${course.name} (ID: ${course.id})`);
    });

    // Use the first course for our test
    const courseId = courses[0].id;
    console.log(`\nUsing course: ${courses[0].name} (ID: ${courseId})`);

    // Create a SpotPlayer exercise with proper metadata
    const spotplayerExercise = {
      title: 'Test SpotPlayer Video Exercise',
      description: 'This is a test exercise for SpotPlayer video integration',
      course_id: courseId,
      difficulty: 'beginner',
      points: 100,
      estimated_time: '30 minutes',
      created_by: '00000000-0000-0000-0000-000000000000', // This will need to be a real user ID
      exercise_type: 'spotplayer',
      auto_grade: false,
      metadata: {
        spotplayer_course_id: 'test_course_123',
        spotplayer_item_id: 'test_item_456'
      }
    };

    console.log('\nAttempting to create SpotPlayer exercise...');
    console.log('Exercise data:', JSON.stringify(spotplayerExercise, null, 2));

    const { data: newExercise, error: createError } = await supabase
      .from('exercises')
      .insert(spotplayerExercise)
      .select()
      .single();

    if (createError) {
      console.error('Error creating SpotPlayer exercise:', createError);
      
      if (createError.code === '42501') {
        console.log('\n⚠️  RLS Policy Error: You need to be authenticated as a user with permission to create exercises.');
        console.log('   This script needs to be run with proper authentication.');
        console.log('   Try running this from the application with a logged-in user.');
      }
      
      return;
    }

    console.log('✅ Successfully created SpotPlayer exercise:');
    console.log(`   ID: ${newExercise.id}`);
    console.log(`   Title: ${newExercise.title}`);
    console.log(`   Type: ${newExercise.exercise_type}`);
    console.log(`   Metadata:`, newExercise.metadata);

    // Test the exerciseFetchService logic
    console.log('\nTesting exerciseFetchService parsing logic...');
    
    let spotplayer_course_id = "";
    let spotplayer_item_id = "";
    
    if (newExercise.metadata) {
      try {
        const metadata = typeof newExercise.metadata === 'string' 
          ? JSON.parse(newExercise.metadata) 
          : newExercise.metadata;
        
        if (metadata && typeof metadata === 'object') {
          spotplayer_course_id = metadata.spotplayer_course_id || "";
          spotplayer_item_id = metadata.spotplayer_item_id || "";
        }
      } catch (error) {
        console.error('Error parsing metadata:', error);
      }
    }
    
    console.log(`   Parsed spotplayer_course_id: ${spotplayer_course_id}`);
    console.log(`   Parsed spotplayer_item_id: ${spotplayer_item_id}`);
    
    if (spotplayer_course_id) {
      console.log('✅ Metadata parsing successful!');
    } else {
      console.log('❌ Metadata parsing failed!');
    }

    // Clean up - delete the test exercise
    console.log('\nCleaning up test exercise...');
    const { error: deleteError } = await supabase
      .from('exercises')
      .delete()
      .eq('id', newExercise.id);

    if (deleteError) {
      console.error('Error deleting test exercise:', deleteError);
    } else {
      console.log('✅ Test exercise cleaned up');
    }

  } catch (error) {
    console.error('Error in createSpotPlayerExercise:', error);
  }
}

createSpotPlayerExercise(); 