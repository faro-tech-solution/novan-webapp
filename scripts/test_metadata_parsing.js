// Test script to verify metadata parsing logic
// Note: We can't import TypeScript directly in Node.js, so we'll simulate the logic

// Mock exercise data with metadata
const mockExerciseWithValidMetadata = {
  id: 'test-exercise-1',
  title: 'Test SpotPlayer Exercise',
  exercise_type: 'spotplayer',
  course_id: 'test-course-1',
  metadata: {
    spotplayer_course_id: 'test_course_123',
    spotplayer_item_id: 'test_item_456'
  }
};

const mockExerciseWithInvalidMetadata = {
  id: 'test-exercise-2',
  title: 'Test SpotPlayer Exercise - Invalid',
  exercise_type: 'spotplayer',
  course_id: 'test-course-1',
  metadata: {
    // Missing spotplayer_course_id
    spotplayer_item_id: 'test_item_456'
  }
};

const mockExerciseWithNoMetadata = {
  id: 'test-exercise-3',
  title: 'Test SpotPlayer Exercise - No Metadata',
  exercise_type: 'spotplayer',
  course_id: 'test-course-1',
  metadata: null
};

const mockNonSpotPlayerExercise = {
  id: 'test-exercise-4',
  title: 'Test Form Exercise',
  exercise_type: 'form',
  course_id: 'test-course-1',
  metadata: {
    spotplayer_course_id: 'test_course_123',
    spotplayer_item_id: 'test_item_456'
  }
};

function testMetadataParsing() {
  console.log('Testing SpotPlayer metadata parsing...\n');

  // Test 1: Valid metadata
  console.log('Test 1: Valid SpotPlayer metadata');
  const validData = extractSpotPlayerData(mockExerciseWithValidMetadata);
  console.log('Result:', validData);
  console.log('Has spotplayer_course_id:', !!validData?.spotplayer_course_id);
  console.log('Expected: true\n');

  // Test 2: Invalid metadata (missing spotplayer_course_id)
  console.log('Test 2: Invalid SpotPlayer metadata (missing spotplayer_course_id)');
  const invalidData = extractSpotPlayerData(mockExerciseWithInvalidMetadata);
  console.log('Result:', invalidData);
  console.log('Has spotplayer_course_id:', !!invalidData?.spotplayer_course_id);
  console.log('Expected: false\n');

  // Test 3: No metadata
  console.log('Test 3: No metadata');
  const noData = extractSpotPlayerData(mockExerciseWithNoMetadata);
  console.log('Result:', noData);
  console.log('Has spotplayer_course_id:', !!noData?.spotplayer_course_id);
  console.log('Expected: false\n');

  // Test 4: Non-SpotPlayer exercise
  console.log('Test 4: Non-SpotPlayer exercise');
  const nonSpotPlayerData = extractSpotPlayerData(mockNonSpotPlayerExercise);
  console.log('Result:', nonSpotPlayerData);
  console.log('Has spotplayer_course_id:', !!nonSpotPlayerData?.spotplayer_course_id);
  console.log('Expected: false\n');

  // Test 5: String metadata
  console.log('Test 5: String metadata');
  const stringMetadataExercise = {
    ...mockExerciseWithValidMetadata,
    metadata: JSON.stringify(mockExerciseWithValidMetadata.metadata)
  };
  const stringData = extractSpotPlayerData(stringMetadataExercise);
  console.log('Result:', stringData);
  console.log('Has spotplayer_course_id:', !!stringData?.spotplayer_course_id);
  console.log('Expected: true\n');

  console.log('✅ All tests completed!');
}

// Since we can't import TypeScript directly in Node.js, let's simulate the logic
function extractSpotPlayerData(exercise) {
  if (exercise.exercise_type !== 'spotplayer') {
    return null;
  }

  try {
    if (!exercise.metadata) {
      return null;
    }

    const parsedMetadata = typeof exercise.metadata === 'string' 
      ? JSON.parse(exercise.metadata) 
      : exercise.metadata;

    if (!parsedMetadata || typeof parsedMetadata !== 'object') {
      return null;
    }

    if (!parsedMetadata.spotplayer_course_id) {
      return null;
    }

    return {
      spotplayer_course_id: parsedMetadata.spotplayer_course_id,
      spotplayer_item_id: parsedMetadata.spotplayer_item_id || undefined,
      spotplayer_license_key: parsedMetadata.spotplayer_license_key || undefined,
      auto_create_license: parsedMetadata.auto_create_license || false
    };
  } catch (error) {
    console.error('Error validating SpotPlayer metadata:', error);
    return null;
  }
}

testMetadataParsing(); 