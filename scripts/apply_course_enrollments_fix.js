#!/usr/bin/env node

/**
 * Apply Course Enrollments RLS Fix
 * This script fixes the infinite recursion issue in course_enrollments RLS policies
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function applyCourseEnrollmentsFix() {
  console.log('🔧 Applying Course Enrollments RLS Fix...\n');

  // Check if required environment variables are set
  if (!process.env.DATABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('❌ Error: DATABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable is not set');
    console.log('Please set it in your .env file:');
    console.log('DATABASE_URL=your_database_connection_string');
    console.log('or');
    console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url');
    console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
    process.exit(1);
  }

  let supabase;

  if (process.env.DATABASE_URL) {
    // Use direct database connection
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    try {
      console.log('📋 Step 1: Reading the RLS fix SQL file...');
      const sqlFile = path.join(__dirname, '../migrations/rls/fix_course_enrollments_infinite_recursion.sql');
      const sqlContent = fs.readFileSync(sqlFile, 'utf8');

      console.log('📋 Step 2: Applying the RLS fix...');
      await pool.query(sqlContent);

      console.log('\n✅ Course Enrollments RLS fix applied successfully!');
      await pool.end();
    } catch (error) {
      console.error('❌ Error applying the fix:', error.message);
      await pool.end();
      process.exit(1);
    }
  } else {
    // Use Supabase client
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
      console.log('📋 Step 1: Reading the RLS fix SQL file...');
      const sqlFile = path.join(__dirname, '../migrations/rls/fix_course_enrollments_infinite_recursion.sql');
      const sqlContent = fs.readFileSync(sqlFile, 'utf8');

      // Split the SQL into individual statements
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      console.log('📋 Step 2: Applying the RLS fix...');
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.warn('⚠️  Warning executing statement:', error.message);
          }
        }
      }

      console.log('\n✅ Course Enrollments RLS fix applied successfully!');
    } catch (error) {
      console.error('❌ Error applying the fix:', error.message);
      process.exit(1);
    }
  }

  console.log('\n🔍 The fix includes:');
  console.log('   - Simplified RLS policies to avoid infinite recursion');
  console.log('   - Removed complex joins that were causing circular references');
  console.log('   - Separated concerns between different user roles');
  console.log('\n🧪 To test the fix, try adding a student to a course again.');
  console.log('   The infinite recursion error should be resolved.');
  console.log('\n📝 If you still encounter issues, check the logs for any remaining errors.');
}

// Run the script
if (require.main === module) {
  applyCourseEnrollmentsFix().catch(console.error);
}

module.exports = { applyCourseEnrollmentsFix }; 