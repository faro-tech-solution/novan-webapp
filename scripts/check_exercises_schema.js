const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExercisesSchema() {
  try {
    console.log('Checking exercises table schema...');
    
    // Try to get table info by selecting all columns
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error accessing exercises table:', error);
      return;
    }

    console.log('✅ Successfully accessed exercises table');
    console.log('Sample data structure:', Object.keys(data?.[0] || {}));
    
    // Try to create a simple exercise to test the schema
    const testExercise = {
      title: 'Test Exercise',
      description: 'Test exercise description',
      course_id: '00000000-0000-0000-0000-000000000000', // Placeholder
      difficulty: 'beginner',
      points: 100,
      estimated_time: '30 minutes',
      created_by: '00000000-0000-0000-0000-000000000000', // Placeholder
      exercise_type: 'form',
      auto_grade: false,
      form_structure: { questions: [] }
    };
    
    console.log('\nTrying to create test exercise with basic fields...');
    const { data: newExercise, error: createError } = await supabase
      .from('exercises')
      .insert(testExercise)
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating test exercise:', createError);
      
      // Try without optional fields
      console.log('\nTrying with minimal fields...');
      const minimalExercise = {
        title: 'Minimal Test Exercise',
        course_id: '00000000-0000-0000-0000-000000000000',
        difficulty: 'beginner',
        points: 100,
        estimated_time: '30 minutes',
        created_by: '00000000-0000-0000-0000-000000000000',
        exercise_type: 'form'
      };
      
      const { data: minimalData, error: minimalError } = await supabase
        .from('exercises')
        .insert(minimalExercise)
        .select()
        .single();
      
      if (minimalError) {
        console.error('Error creating minimal exercise:', minimalError);
      } else {
        console.log('✅ Successfully created minimal exercise:', minimalData);
        
        // Clean up
        await supabase
          .from('exercises')
          .delete()
          .eq('id', minimalData.id);
        console.log('✅ Cleaned up test exercise');
      }
    } else {
      console.log('✅ Successfully created test exercise:', newExercise);
      
      // Clean up
      await supabase
        .from('exercises')
        .delete()
        .eq('id', newExercise.id);
      console.log('✅ Cleaned up test exercise');
    }
    
  } catch (error) {
    console.error('Error in schema check:', error);
  }
}

checkExercisesSchema(); 