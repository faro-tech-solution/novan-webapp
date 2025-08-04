const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSpotPlayerData() {
  try {
    console.log('Checking SpotPlayer exercise data...');
    
    // Check all exercises to see their types
    const { data: allExercises, error: allError } = await supabase
      .from('exercises')
      .select('id, title, exercise_type, metadata')
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('Error fetching exercises:', allError);
      return;
    }

    console.log(`Found ${allExercises.length} total exercises`);
    
    // Group by exercise type
    const exerciseTypes = {};
    allExercises.forEach(exercise => {
      const type = exercise.exercise_type || 'unknown';
      if (!exerciseTypes[type]) {
        exerciseTypes[type] = [];
      }
      exerciseTypes[type].push(exercise);
    });
    
    console.log('\nExercise types found:');
    Object.entries(exerciseTypes).forEach(([type, exercises]) => {
      console.log(`  ${type}: ${exercises.length} exercises`);
    });
    
    // Check SpotPlayer exercises specifically
    const spotplayerExercises = exerciseTypes['spotplayer'] || [];
    console.log(`\nSpotPlayer exercises: ${spotplayerExercises.length}`);
    
    spotplayerExercises.forEach((exercise, index) => {
      console.log(`\n${index + 1}. ${exercise.title} (ID: ${exercise.id})`);
      console.log(`   Metadata:`, exercise.metadata);
      
      if (exercise.metadata) {
        try {
          const metadata = typeof exercise.metadata === 'string' 
            ? JSON.parse(exercise.metadata) 
            : exercise.metadata;
          
          if (metadata && typeof metadata === 'object') {
            console.log(`   spotplayer_course_id: ${metadata.spotplayer_course_id || 'NOT SET'}`);
            console.log(`   spotplayer_item_id: ${metadata.spotplayer_item_id || 'NOT SET'}`);
            
            if (!metadata.spotplayer_course_id) {
              console.log(`   ⚠️  WARNING: No spotplayer_course_id found!`);
            }
          }
        } catch (error) {
          console.error('   Error parsing metadata:', error);
        }
      } else {
        console.log(`   ⚠️  WARNING: No metadata field found!`);
      }
    });
    
    // Check if there are any exercises with metadata but wrong type
    console.log('\nChecking for exercises with SpotPlayer metadata but wrong type...');
    const exercisesWithSpotPlayerMetadata = allExercises.filter(exercise => {
      if (!exercise.metadata) return false;
      
      try {
        const metadata = typeof exercise.metadata === 'string' 
          ? JSON.parse(exercise.metadata) 
          : exercise.metadata;
        
        return metadata && typeof metadata === 'object' && 
               (metadata.spotplayer_course_id || metadata.spotplayer_item_id);
      } catch {
        return false;
      }
    });
    
    exercisesWithSpotPlayerMetadata.forEach((exercise, index) => {
      console.log(`\n${index + 1}. ${exercise.title} (Type: ${exercise.exercise_type})`);
      console.log(`   ID: ${exercise.id}`);
      console.log(`   Metadata:`, exercise.metadata);
    });
    
  } catch (error) {
    console.error('Error in check:', error);
  }
}

checkSpotPlayerData(); 