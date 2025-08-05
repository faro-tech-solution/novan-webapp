const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applySpotPlayerMigration() {
  try {
    console.log('Applying SpotPlayer exercise type migration...');
    
    // Drop the existing constraint
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.exercises 
        DROP CONSTRAINT IF EXISTS exercises_exercise_type_check;
      `
    });
    
    if (dropError) {
      console.error('Error dropping constraint:', dropError);
      return;
    }
    
    // Add the new constraint that includes 'spotplayer'
    const { error: addError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.exercises 
        ADD CONSTRAINT exercises_exercise_type_check 
        CHECK (exercise_type IN ('form', 'video', 'audio', 'simple', 'spotplayer'));
      `
    });
    
    if (addError) {
      console.error('Error adding constraint:', addError);
      return;
    }
    
    console.log('✅ Successfully applied SpotPlayer exercise type migration');
    console.log('The exercise_type constraint now allows: form, video, audio, simple, spotplayer');
    
  } catch (error) {
    console.error('Error applying migration:', error);
  }
}

applySpotPlayerMigration(); 