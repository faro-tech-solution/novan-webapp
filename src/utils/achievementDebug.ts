import { supabase } from '@/integrations/supabase/client';

/**
 * Utility function to debug the achievements system
 * Call this from browser console to check if achievements are working
 */
export async function debugAchievements(studentId: string) {
  console.log('==== ACHIEVEMENT SYSTEM DEBUG ====');
  
  // Step 1: Get user info
  console.log('1. Checking student ID:', studentId);
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', studentId)
    .single();
  
  if (userError) {
    console.error('Failed to find user profile:', userError);
    return;
  }
  console.log('Found user profile:', user?.email || user?.id);
  
  // Step 2: Check existing awards
  console.log('2. Checking existing student awards...');
  const { data: existingAwards, error: awardsError } = await supabase
    .from('student_awards')
    .select(`
      id,
      student_id,
      award_id,
      earned_at,
      awards (
        name,
        description,
        rarity
      )
    `)
    .eq('student_id', studentId);
  
  if (awardsError) {
    console.error('Failed to fetch awards:', awardsError);
  } else {
    console.log(`Found ${existingAwards?.length || 0} existing awards:`);
    existingAwards?.forEach(award => {
      console.log(`- ${award.awards?.name} (${award.awards?.rarity}): earned on ${new Date(award.earned_at).toLocaleString()}`);
    });
  }
  
  // Step 3: Check exercise submissions
  console.log('3. Checking exercise submissions...');
  const { data: submissions, error: submissionsError } = await supabase
    .from('exercise_submissions')
    .select('exercise_id, submitted_at, score')
    .eq('student_id', studentId);
  
  if (submissionsError) {
    console.error('Failed to fetch submissions:', submissionsError);
  } else {
    console.log(`Found ${submissions?.length || 0} submissions`);
    const perfectScores = submissions?.filter(sub => sub.score === 100).length || 0;
    console.log(`- Perfect scores (100%): ${perfectScores}`);
    const highScores = submissions?.filter(sub => sub.score && sub.score >= 90).length || 0;
    console.log(`- High scores (90%+): ${highScores}`);
  }
  
  // Step 4: Try to manually trigger achievement check
  console.log('4. Manually triggering achievement check...');
  const { data, error: rpcError } = await supabase.rpc('check_and_award_achievements', {
    student_id_param: studentId
  });
  
  if (rpcError) {
    console.error('RPC call failed:', rpcError);
  } else {
    console.log('RPC result:', data);
  }
  
  // Step 5: Check if new awards were added
  console.log('5. Checking for new awards...');
  const { data: newAwards, error: newAwardsError } = await supabase
    .from('student_awards')
    .select(`
      id,
      student_id,
      award_id,
      earned_at,
      awards (
        name,
        description,
        rarity
      )
    `)
    .eq('student_id', studentId);
  
  if (newAwardsError) {
    console.error('Failed to fetch updated awards:', newAwardsError);
  } else {
    const newCount = (newAwards?.length || 0) - (existingAwards?.length || 0);
    if (newCount > 0) {
      console.log(`Added ${newCount} new awards!`);
      // Show the new awards
      const newlyAdded = newAwards?.slice(0, newCount);
      newlyAdded?.forEach(award => {
        console.log(`- NEW: ${award.awards?.name} (${award.awards?.rarity}): earned on ${new Date(award.earned_at).toLocaleString()}`);
      });
    } else {
      console.log('No new awards were added.');
    }
  }
  
  console.log('==== DEBUG COMPLETE ====');
  return { 
    user,
    awards: existingAwards,
    submissions,
    rpcResult: data,
    newAwards
  };
}

// Make it available in the window object for easy console access
// @ts-ignore
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.debugAchievements = debugAchievements;
}
