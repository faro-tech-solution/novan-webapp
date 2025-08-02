// Test script to debug student courses API issue
// Run this with: node scripts/test_student_courses_api.js

const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStudentCoursesAPI() {
  console.log('🔍 Testing Student Courses API...\n');

  try {
    // 1. Check if there are any trainees
    console.log('1. Checking trainees...');
    const { data: trainees, error: traineesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role, email')
      .eq('role', 'trainee')
      .limit(5);

    if (traineesError) {
      console.error('❌ Error fetching trainees:', traineesError);
      return;
    }

    console.log(`✅ Found ${trainees.length} trainees`);
    trainees.forEach(t => console.log(`   - ${t.first_name} ${t.last_name} (${t.email})`));

    if (trainees.length === 0) {
      console.log('❌ No trainees found - this is why student courses shows empty');
      return;
    }

    // 2. Test with the first trainee
    const testUserId = trainees[0].id;
    console.log(`\n2. Testing with user: ${trainees[0].first_name} ${trainees[0].last_name} (${testUserId})`);

    // 3. Check course enrollments for this user
    console.log('\n3. Checking course enrollments...');
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('course_enrollments')
      .select(`
        id,
        course_id,
        enrolled_at,
        status,
        courses (
          id,
          name,
          description
        )
      `)
      .eq('student_id', testUserId)
      .eq('status', 'active');

    if (enrollmentsError) {
      console.error('❌ Error fetching enrollments:', enrollmentsError);
      return;
    }

    console.log(`✅ Found ${enrollments.length} active enrollments`);
    enrollments.forEach(e => {
      console.log(`   - Course: ${e.courses?.name || 'Unknown'} (${e.course_id})`);
      console.log(`     Status: ${e.status}, Enrolled: ${e.enrolled_at}`);
    });

    if (enrollments.length === 0) {
      console.log('❌ No active enrollments found - this is why student courses shows empty');
      
      // Check if there are any enrollments at all (not just active)
      const { data: allEnrollments, error: allEnrollmentsError } = await supabase
        .from('course_enrollments')
        .select('status')
        .eq('student_id', testUserId);

      if (!allEnrollmentsError && allEnrollments) {
        console.log('\n📊 All enrollments for this user:');
        const statusCounts = allEnrollments.reduce((acc, e) => {
          acc[e.status] = (acc[e.status] || 0) + 1;
          return acc;
        }, {});
        console.log(statusCounts);
      }
      return;
    }

    // 4. Test the exact query that the frontend uses
    console.log('\n4. Testing exact frontend query...');
    const { data: frontendQueryResult, error: frontendQueryError } = await supabase
      .from('course_enrollments')
      .select(`
        id,
        course_id,
        enrolled_at,
        status,
        courses (
          id,
          name,
          description
        )
      `)
      .eq('student_id', testUserId)
      .eq('status', 'active');

    if (frontendQueryError) {
      console.error('❌ Frontend query error:', frontendQueryError);
      return;
    }

    console.log(`✅ Frontend query returned ${frontendQueryResult.length} results`);
    
    // 5. Test the data transformation
    console.log('\n5. Testing data transformation...');
    const enrollmentsWithCourses = (frontendQueryResult || []).filter(
      (enrollment) => enrollment.courses && typeof enrollment.courses === 'object' && !('code' in enrollment.courses)
    );

    console.log(`✅ Filtered to ${enrollmentsWithCourses.length} valid enrollments`);

    const transformedCourses = enrollmentsWithCourses.map(enrollment => {
      const course = enrollment.courses;
      return {
        id: enrollment.course_id,
        title: course?.name ?? '',
        instructor: 'نامشخص',
        progress: 0,
        totalLessons: 0,
        completedLessons: 0,
        duration: '0 ساعت',
        difficulty: 'متوسط',
        category: 'عمومی',
        thumbnail: '',
        enrollDate: enrollment.enrolled_at,
        nextLesson: null,
        status: enrollment.status,
        description: course?.description ?? undefined
      };
    });

    console.log(`✅ Transformed to ${transformedCourses.length} courses`);
    transformedCourses.forEach(course => {
      console.log(`   - ${course.title} (${course.status})`);
    });

    // 6. Check if there are any courses in the database
    console.log('\n6. Checking courses table...');
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, name, status')
      .limit(10);

    if (coursesError) {
      console.error('❌ Error fetching courses:', coursesError);
      return;
    }

    console.log(`✅ Found ${courses.length} courses in database`);
    courses.forEach(c => console.log(`   - ${c.name} (${c.status})`));

    // 7. Summary
    console.log('\n📊 Summary:');
    console.log(`   - Trainees: ${trainees.length}`);
    console.log(`   - Active enrollments for test user: ${enrollments.length}`);
    console.log(`   - Valid enrollments after filtering: ${enrollmentsWithCourses.length}`);
    console.log(`   - Transformed courses: ${transformedCourses.length}`);
    console.log(`   - Total courses in database: ${courses.length}`);
    
    if (trainees.length > 0 && enrollments.length > 0 && transformedCourses.length > 0) {
      console.log('✅ Student courses should show data. If it shows empty, check:');
      console.log('   1. User authentication in the browser');
      console.log('   2. RLS policies on course_enrollments table');
      console.log('   3. Network requests in browser dev tools');
    } else {
      console.log('❌ Student courses will show empty because of missing data.');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testStudentCoursesAPI(); 