// Test script to check database schema and identify constraint issues
const { createClient } = require('@supabase/supabase-js');

// This script requires DATABASE_URL environment variable
const DATABASE_URL = process.env.DATABASE_URL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!DATABASE_URL && (!SUPABASE_URL || !SUPABASE_ANON_KEY)) {
  console.log('❌ No database connection available');
  console.log('Please set DATABASE_URL or NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

async function checkDatabaseSchema() {
  try {
    let supabase;
    
    if (DATABASE_URL) {
      // Use direct database connection
      const { Pool } = require('pg');
      const pool = new Pool({ connectionString: DATABASE_URL });
      
      console.log('🔍 Checking database schema...');
      
      // Check if exercise_submissions table exists
      const tableExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'exercise_submissions'
        );
      `);
      
      if (!tableExists.rows[0].exists) {
        console.log('❌ exercise_submissions table does not exist');
        return;
      }
      
      // Check table structure
      const tableStructure = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'exercise_submissions'
        ORDER BY ordinal_position;
      `);
      
      console.log('📋 exercise_submissions table structure:');
      tableStructure.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
      });
      
      // Check constraints
      const constraints = await pool.query(`
        SELECT constraint_name, constraint_type, check_clause
        FROM information_schema.table_constraints tc
        LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
        WHERE tc.table_name = 'exercise_submissions';
      `);
      
      console.log('\n🔒 Constraints on exercise_submissions table:');
      constraints.rows.forEach(row => {
        console.log(`  - ${row.constraint_name}: ${row.constraint_type} ${row.check_clause ? `(${row.check_clause})` : ''}`);
      });
      
      // Check if latest_answer_check constraint exists
      const latestAnswerConstraint = await pool.query(`
        SELECT constraint_name, check_clause
        FROM information_schema.check_constraints
        WHERE constraint_name = 'exercise_submissions_latest_answer_check';
      `);
      
      if (latestAnswerConstraint.rows.length > 0) {
        console.log('\n⚠️  Found latest_answer_check constraint:');
        console.log(`  - ${latestAnswerConstraint.rows[0].constraint_name}: ${latestAnswerConstraint.rows[0].check_clause}`);
      } else {
        console.log('\n✅ No latest_answer_check constraint found');
      }
      
      await pool.end();
      
    } else {
      // Use Supabase client
      supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      
      console.log('🔍 Checking Supabase schema...');
      
      // Try to get table info
      const { data, error } = await supabase
        .from('exercise_submissions')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log('❌ Error accessing exercise_submissions table:', error.message);
        return;
      }
      
      console.log('✅ exercise_submissions table is accessible');
    }
    
  } catch (error) {
    console.log('❌ Error checking database schema:', error.message);
  }
}

checkDatabaseSchema(); 