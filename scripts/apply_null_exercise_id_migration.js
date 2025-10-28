#!/usr/bin/env node

// Script to apply the migration for allowing NULL exercise_id in exercise_notes table
// This allows creating global notes that are not tied to any specific exercise

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function applyMigration() {
  console.log('🔄 Applying migration: Allow NULL exercise_id in exercise_notes table...');

  // Check if we have the required environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Error: Missing required environment variables.');
    console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
    process.exit(1);
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('📝 Executing SQL migration...');

    // Execute the migration SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE exercise_notes 
        ALTER COLUMN exercise_id DROP NOT NULL;
        
        COMMENT ON COLUMN exercise_notes.exercise_id IS 'Exercise ID - NULL for global course notes, specific exercise ID for exercise-specific notes';
      `
    });

    if (error) {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    }

    console.log('✅ Migration applied successfully!');
    console.log('📋 Changes made:');
    console.log('   - exercise_id column in exercise_notes table now allows NULL values');
    console.log('   - This enables creating global notes not tied to specific exercises');
    console.log('');
    console.log('🎯 You can now create global notes from the /notes page!');

  } catch (err) {
    console.error('❌ Migration failed with error:', err.message);
    process.exit(1);
  }
}

// Run the migration
applyMigration();