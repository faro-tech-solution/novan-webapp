const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read environment variables from .env file
const envContent = fs.readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key] = value;
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSpotPlayerExercise() {
  try {
    console.log('Testing SpotPlayer exercise creation...');
    
    // Try to create a test exercise with spotplayer type
    const { data, error } = await supabase
      .from('exercises')
      .insert({
        title: 'Test SpotPlayer Exercise',
        description: 'Test exercise for spotplayer type',
        difficulty: 'آسان',
        points: 100,
        estimated_time: '30 دقیقه',
        exercise_type: 'spotplayer',
        course_id: '00000000-0000-0000-0000-000000000000', // dummy course ID
        created_by: '00000000-0000-0000-0000-000000000000', // dummy user ID
        days_to_open: 0,
        days_to_due: 7,
        days_to_close: 14
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating spotplayer exercise:', error);
      console.log('This confirms the constraint needs to be updated');
    } else {
      console.log('✅ SpotPlayer exercise created successfully:', data);
      
      // Clean up the test exercise
      await supabase
        .from('exercises')
        .delete()
        .eq('id', data.id);
    }
    
  } catch (error) {
    console.error('Error in test:', error);
  }
}

testSpotPlayerExercise(); 