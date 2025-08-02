// Test script to debug course_enrollments API issue
// Run this with: node scripts/test_course_enrollments_api.js

const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCourseEnrollmentsAPI() {
  console.log('🔍 Testing Course Enrollments API...\n');

  const testUserId = 'af3bb07e-8fc3-40c1-9222-430c6c48eabd';

  try {
    // 1. Test the exact API call that's failing
    console.log('1. Testing exact API call...');
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('course_enrollments')
      .select(`
        course_id,
        enrolled_at,
        term_id,
        courses (
          id,
          name
        ),
        course_terms (
          id,
          start_date,
          end_date
        )
      `)
      .eq('student_id', testUserId)
      .eq('status', 'active');

    if (enrollmentsError) {
      console.error('❌ API call error:', enrollmentsError);
      return;
    }

    console.log(`✅ API call successful, returned ${enrollments.length} enrollments`);
    console.log('📋 Raw API response:', JSON.stringify(enrollments, null, 2));

    // 2. Check if the user exists
    console.log('\n2. Checking if user exists...');
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role, email')
      .eq('id', testUserId)
      .single();

    if (userError) {
      console.error('❌ User not found:', userError);
    } else {
      console.log('✅ User found:', user);
    }

    // 3. Check enrollments without joins
    console.log('\n3. Checking enrollments without joins...');
    const { data: basicEnrollments, error: basicError } = await supabase
      .from('course_enrollments')
      .select('*')
      .eq('student_id', testUserId)
      .eq('status', 'active');

    if (basicError) {
      console.error('❌ Basic enrollments error:', basicError);
    } else {
      console.log(`✅ Found ${basicEnrollments.length} basic enrollments:`);
      basicEnrollments.forEach(e => {
        console.log(`   - Enrollment ID: ${e.id}`);
        console.log(`     Course ID: ${e.course_id}`);
        console.log(`     Term ID: ${e.term_id || 'NULL'}`);
        console.log(`     Status: ${e.status}`);
        console.log(`     Enrolled: ${e.enrolled_at}`);
      });
    }

    // 4. Check courses separately
    if (basicEnrollments && basicEnrollments.length > 0) {
      console.log('\n4. Checking courses separately...');
      const courseIds = basicEnrollments.map(e => e.course_id).filter(Boolean);
      
      if (courseIds.length > 0) {
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .in('id', courseIds);

        if (coursesError) {
          console.error('❌ Courses error:', coursesError);
        } else {
          console.log(`✅ Found ${courses.length} courses:`);
          courses.forEach(c => {
            console.log(`   - Course ID: ${c.id}`);
            console.log(`     Name: ${c.name}`);
            console.log(`     Status: ${c.status}`);
            console.log(`     Instructor: ${c.instructor_name}`);
          });
        }
      } else {
        console.log('⚠️  No course IDs found in enrollments');
      }
    }

    // 5. Check course_terms separately
    if (basicEnrollments && basicEnrollments.length > 0) {
      console.log('\n5. Checking course_terms separately...');
      const termIds = basicEnrollments.map(e => e.term_id).filter(Boolean);
      
      if (termIds.length > 0) {
        const { data: terms, error: termsError } = await supabase
          .from('course_terms')
          .select('*')
          .in('id', termIds);

        if (termsError) {
          console.error('❌ Terms error:', termsError);
        } else {
          console.log(`✅ Found ${terms.length} terms:`);
          terms.forEach(t => {
            console.log(`   - Term ID: ${t.id}`);
            console.log(`     Name: ${t.name}`);
            console.log(`     Course ID: ${t.course_id}`);
            console.log(`     Start: ${t.start_date}`);
            console.log(`     End: ${t.end_date}`);
          });
        }
      } else {
        console.log('⚠️  No term IDs found in enrollments');
      }
    }

    // 6. Test individual joins
    console.log('\n6. Testing individual joins...');
    
    // Test courses join
    const { data: enrollmentsWithCourses, error: coursesJoinError } = await supabase
      .from('course_enrollments')
      .select(`
        id,
        course_id,
        courses (
          id,
          name,
          status
        )
      `)
      .eq('student_id', testUserId)
      .eq('status', 'active');

    if (coursesJoinError) {
      console.error('❌ Courses join error:', coursesJoinError);
    } else {
      console.log('✅ Courses join result:');
      enrollmentsWithCourses.forEach(e => {
        console.log(`   - Enrollment: ${e.id}, Course: ${e.course_id}`);
        console.log(`     Course data:`, e.courses);
      });
    }

    // Test terms join
    const { data: enrollmentsWithTerms, error: termsJoinError } = await supabase
      .from('course_enrollments')
      .select(`
        id,
        term_id,
        course_terms (
          id,
          name,
          start_date
        )
      `)
      .eq('student_id', testUserId)
      .eq('status', 'active');

    if (termsJoinError) {
      console.error('❌ Terms join error:', termsJoinError);
    } else {
      console.log('✅ Terms join result:');
      enrollmentsWithTerms.forEach(e => {
        console.log(`   - Enrollment: ${e.id}, Term: ${e.term_id}`);
        console.log(`     Term data:`, e.course_terms);
      });
    }

    // 7. Check RLS policies
    console.log('\n7. Checking if RLS might be blocking access...');
    
    // Test with different user context (if possible)
    console.log('⚠️  RLS policies might be blocking access to related tables');
    console.log('   Check if the current user has permission to access courses and course_terms tables');

    // 8. Summary
    console.log('\n📊 Summary:');
    console.log(`   - User ID: ${testUserId}`);
    console.log(`   - Basic enrollments: ${basicEnrollments?.length || 0}`);
    console.log(`   - Enrollments with courses: ${enrollmentsWithCourses?.length || 0}`);
    console.log(`   - Enrollments with terms: ${enrollmentsWithTerms?.length || 0}`);
    console.log(`   - API response enrollments: ${enrollments?.length || 0}`);
    
    if (enrollments && enrollments.length > 0) {
      const hasEmptyCourses = enrollments.some(e => !e.courses);
      const hasEmptyTerms = enrollments.some(e => e.term_id && !e.course_terms);
      
      console.log(`   - Enrollments with empty courses: ${hasEmptyCourses}`);
      console.log(`   - Enrollments with empty terms: ${hasEmptyTerms}`);
      
      if (hasEmptyCourses || hasEmptyTerms) {
        console.log('\n🔧 Possible solutions:');
        console.log('   1. Check if courses/terms exist in the database');
        console.log('   2. Check RLS policies on courses and course_terms tables');
        console.log('   3. Check foreign key constraints');
        console.log('   4. Verify data integrity');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testCourseEnrollmentsAPI(); 