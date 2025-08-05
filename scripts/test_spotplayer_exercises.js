const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSpotPlayerExercises() {
  try {
    console.log('Testing SpotPlayer exercises...');
    
    // Fetch all exercises with spotplayer type
    const { data: spotplayerExercises, error } = await supabase
      .from('exercises')
      .select(`
        *,
        courses!inner (
          name
        )
      `)
      .eq('exercise_type', 'spotplayer')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching SpotPlayer exercises:', error);
      return;
    }

    console.log(`Found ${spotplayerExercises.length} SpotPlayer exercises:`);
    
    spotplayerExercises.forEach((exercise, index) => {
      console.log(`\n${index + 1}. Exercise: ${exercise.title}`);
      console.log(`   ID: ${exercise.id}`);
      console.log(`   Course: ${exercise.courses.name}`);
      console.log(`   Metadata:`, exercise.metadata);
      
      // Parse metadata to extract SpotPlayer fields
      let spotplayer_course_id = "";
      let spotplayer_item_id = "";
      
      if (exercise.metadata) {
        try {
          const metadata = typeof exercise.metadata === 'string' 
            ? JSON.parse(exercise.metadata) 
            : exercise.metadata;
          
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
      
      if (!spotplayer_course_id) {
        console.log(`   ⚠️  WARNING: No spotplayer_course_id found in metadata`);
      }
    });
    
    // Test creating a sample SpotPlayer exercise with metadata
    console.log('\n\nTesting creation of SpotPlayer exercise with metadata...');
    
    const sampleMetadata = {
      spotplayer_course_id: "test_course_123",
      spotplayer_item_id: "test_item_456"
    };
    
    const { data: newExercise, error: createError } = await supabase
      .from('exercises')
      .insert({
        title: 'Test SpotPlayer Exercise',
        description: 'Test exercise for SpotPlayer integration',
        course_id: spotplayerExercises[0]?.course_id || '00000000-0000-0000-0000-000000000000',
        difficulty: 'beginner',
        points: 100,
        estimated_time: '30 minutes',
        created_by: '00000000-0000-0000-0000-000000000000', // Replace with actual user ID
        exercise_type: 'spotplayer',
        metadata: sampleMetadata,
        days_to_open: 0,
        days_to_due: 7,
        days_to_close: 14
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating test exercise:', createError);
    } else {
      console.log('✅ Successfully created test SpotPlayer exercise:');
      console.log(`   ID: ${newExercise.id}`);
      console.log(`   Metadata:`, newExercise.metadata);
      
      // Clean up - delete the test exercise
      await supabase
        .from('exercises')
        .delete()
        .eq('id', newExercise.id);
      
      console.log('✅ Test exercise cleaned up');
    }
    
  } catch (error) {
    console.error('Error in test:', error);
  }
}

testSpotPlayerExercises(); 