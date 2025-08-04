const { SpotPlayerService } = require('../src/services/spotPlayerService');

async function testSpotPlayerAPI() {
  console.log('🧪 Testing SpotPlayer API Configuration...\n');

  // Check if API key is configured
  const apiKey = process.env.NEXT_PUBLIC_SPOTPLAYER_API_KEY || process.env.SPOTPLAYER_API_KEY;
  
  if (!apiKey) {
    console.log('❌ API Key not found in environment variables');
    console.log('   Please set NEXT_PUBLIC_SPOTPLAYER_API_KEY or SPOTPLAYER_API_KEY');
    return;
  }

  console.log('✅ API Key is configured');
  console.log(`   Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 10)}`);

  try {
    // Test license creation
    console.log('\n🔑 Testing license creation...');
    
    const testUserId = 'test_user_123';
    const testCourseId = 'test_course_456';
    const testSpotPlayerCourseId = '5d2ee35bcddc092a304ae5eb'; // Example course ID from docs

    const licenseResult = await SpotPlayerService.createLicense(
      testUserId,
      testCourseId,
      testSpotPlayerCourseId,
      true // Test license
    );

    console.log('✅ License created successfully!');
    console.log(`   License ID: ${licenseResult.licenseId}`);
    console.log(`   License Key: ${licenseResult.licenseKey.substring(0, 20)}...`);
    console.log(`   URL: ${licenseResult.url}`);

    // Test cookie creation
    console.log('\n🍪 Testing cookie creation...');
    const cookieValue = await SpotPlayerService.getOrCreateCookie(testUserId);
    console.log('✅ Cookie created successfully!');
    console.log(`   Cookie: ${cookieValue.substring(0, 20)}...`);

    // Test full config
    console.log('\n⚙️ Testing full configuration...');
    const config = await SpotPlayerService.getSpotPlayerConfig(
      testUserId,
      testCourseId,
      testSpotPlayerCourseId,
      'test_item_789'
    );

    console.log('✅ Configuration created successfully!');
    console.log(`   Course ID: ${config.courseId}`);
    console.log(`   Item ID: ${config.itemId}`);
    console.log(`   License Key: ${config.license.license_key.substring(0, 20)}...`);
    console.log(`   Cookie: ${config.cookie.cookie_value.substring(0, 20)}...`);

    console.log('\n🎉 All tests passed! SpotPlayer integration is working correctly.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.message.includes('API key is not configured')) {
      console.log('\n💡 Make sure to set the environment variable:');
      console.log('   NEXT_PUBLIC_SPOTPLAYER_API_KEY=your_api_key_here');
    } else if (error.message.includes('SpotPlayer API error')) {
      console.log('\n💡 Check your API key and make sure it has the correct permissions');
    }
  }
}

// Run the test
testSpotPlayerAPI().catch(console.error); 