// Test script to verify dashboard data
// Run this with: node scripts/test_dashboard_data.js

const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDashboardData() {
  console.log('🔍 Testing Dashboard Data...\n');

  try {
    // 1. Check if there are any trainees
    console.log('1. Checking trainees...');
    const { data: trainees, error: traineesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role, class_name')
      .eq('role', 'trainee')
      .limit(5);

    if (traineesError) {
      console.error('❌ Error fetching trainees:', traineesError);
      return;
    }

    console.log(`✅ Found ${trainees.length} trainees`);
    trainees.forEach(t => console.log(`   - ${t.first_name} ${t.last_name} (${t.class_name})`));

    if (trainees.length === 0) {
      console.log('❌ No trainees found - this is why dashboard shows 0 statistics');
      return;
    }

    // 2. Check course enrollments
    console.log('\n2. Checking course enrollments...');
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('course_enrollments')
      .select(`
        id,
        student_id,
        course_id,
        status,
        enrolled_at,
        term_id,
        courses (id, name),
        course_terms (id, start_date, end_date)
      `)
      .eq('status', 'active')
      .limit(10);

    if (enrollmentsError) {
      console.error('❌ Error fetching enrollments:', enrollmentsError);
      return;
    }

    console.log(`✅ Found ${enrollments.length} active enrollments`);
    enrollments.forEach(e => {
      console.log(`   - Student ${e.student_id} enrolled in ${e.courses?.name || 'Unknown Course'}`);
    });

    if (enrollments.length === 0) {
      console.log('❌ No active enrollments found - this is why dashboard shows 0 statistics');
      return;
    }

    // 3. Check exercises for enrolled courses
    console.log('\n3. Checking exercises...');
    const courseIds = enrollments.map(e => e.course_id).filter(Boolean);
    
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select(`
        id,
        title,
        course_id,
        days_to_open,
        days_to_due,
        days_to_close,
        points,
        created_at,
        courses (id, name)
      `)
      .in('course_id', courseIds)
      .limit(10);

    if (exercisesError) {
      console.error('❌ Error fetching exercises:', exercisesError);
      return;
    }

    console.log(`✅ Found ${exercises.length} exercises for enrolled courses`);
    exercises.forEach(e => {
      console.log(`   - ${e.title} (${e.courses?.name}) - Points: ${e.points}`);
      console.log(`     Days: open=${e.days_to_open}, due=${e.days_to_due}, close=${e.days_to_close}`);
    });

    if (exercises.length === 0) {
      console.log('❌ No exercises found for enrolled courses - this is why dashboard shows 0 statistics');
      return;
    }

    // 4. Check exercise submissions
    console.log('\n4. Checking exercise submissions...');
    const exerciseIds = exercises.map(e => e.id);
    const studentIds = trainees.map(t => t.id);

    const { data: submissions, error: submissionsError } = await supabase
      .from('exercise_submissions')
      .select(`
        id,
        exercise_id,
        student_id,
        score,
        submitted_at,
        auto_graded,
        completion_percentage
      `)
      .in('exercise_id', exerciseIds)
      .in('student_id', studentIds)
      .limit(10);

    if (submissionsError) {
      console.error('❌ Error fetching submissions:', submissionsError);
      return;
    }

    console.log(`✅ Found ${submissions.length} exercise submissions`);
    submissions.forEach(s => {
      console.log(`   - Exercise ${s.exercise_id} by Student ${s.student_id} - Score: ${s.score}`);
    });

    // 5. Test date calculations for a specific exercise
    console.log('\n5. Testing date calculations...');
    if (exercises.length > 0 && enrollments.length > 0) {
      const testExercise = exercises[0];
      const testEnrollment = enrollments.find(e => e.course_id === testExercise.course_id);
      
      if (testEnrollment) {
        console.log(`Testing exercise: ${testExercise.title}`);
        console.log(`Enrollment: ${testEnrollment.courses?.name}`);
        
        const referenceStartDate = testEnrollment.course_terms?.start_date 
          ? new Date(testEnrollment.course_terms.start_date)
          : new Date(testEnrollment.enrolled_at);
        
        const openDate = new Date(referenceStartDate);
        openDate.setDate(openDate.getDate() + (testExercise.days_to_open || 0));
        
        const dueDate = new Date(referenceStartDate);
        dueDate.setDate(dueDate.getDate() + ((testExercise.days_to_open || 0) + (testExercise.days_to_due || 7)));
        
        const closeDate = new Date(referenceStartDate);
        if (testExercise.days_to_close !== null && testExercise.days_to_close !== undefined) {
          closeDate.setDate(closeDate.getDate() + testExercise.days_to_close);
        } else {
          closeDate.setDate(dueDate.getDate() + 7);
        }
        
        const today = new Date();
        
        console.log(`   Reference start: ${referenceStartDate.toISOString()}`);
        console.log(`   Open date: ${openDate.toISOString()}`);
        console.log(`   Due date: ${dueDate.toISOString()}`);
        console.log(`   Close date: ${closeDate.toISOString()}`);
        console.log(`   Today: ${today.toISOString()}`);
        console.log(`   Is open: ${today >= openDate}`);
        console.log(`   Is overdue: ${today > closeDate}`);
      }
    }

    // 6. Summary
    console.log('\n📊 Summary:');
    console.log(`   - Trainees: ${trainees.length}`);
    console.log(`   - Active enrollments: ${enrollments.length}`);
    console.log(`   - Exercises: ${exercises.length}`);
    console.log(`   - Submissions: ${submissions.length}`);
    
    if (trainees.length > 0 && enrollments.length > 0 && exercises.length > 0) {
      console.log('✅ Dashboard should show data. If it shows 0, check the date calculations above.');
    } else {
      console.log('❌ Dashboard will show 0 because of missing data.');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testDashboardData(); 