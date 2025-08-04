const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://dynmgviifqrozsczabvz.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "your-service-role-key-here";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupStorageBucket() {
  console.log('🔍 Checking Supabase storage buckets...');
  
  try {
    // List existing buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }
    
    console.log('📦 Existing buckets:', buckets?.map(b => b.name) || []);
    
    // Check if attachments bucket exists
    const attachmentsBucket = buckets?.find(b => b.name === 'attachments');
    
    if (!attachmentsBucket) {
      console.log('🔄 Creating attachments bucket...');
      
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('attachments', {
        public: true,
        allowedMimeTypes: [
          'image/*', 
          'application/pdf', 
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'text/*'
        ],
        fileSizeLimit: 52428800 // 50MB
      });
      
      if (createError) {
        console.error('❌ Error creating bucket:', createError);
        return;
      }
      
      console.log('✅ Attachments bucket created successfully');
    } else {
      console.log('✅ Attachments bucket already exists');
    }
    
    // Create exercise-conversation folder
    console.log('📁 Creating exercise-conversation folder...');
    
    const { data: folderData, error: folderError } = await supabase.storage
      .from('attachments')
      .list('exercise-conversation', {
        limit: 1
      });
    
    if (folderError && folderError.message.includes('not found')) {
      // Create a dummy file to create the folder
      const dummyFile = new Blob(['dummy'], { type: 'text/plain' });
      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload('exercise-conversation/.gitkeep', dummyFile);
      
      if (uploadError) {
        console.error('❌ Error creating folder:', uploadError);
      } else {
        console.log('✅ exercise-conversation folder created');
      }
    } else {
      console.log('✅ exercise-conversation folder already exists');
    }
    
    console.log('🎉 Storage setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the setup
setupStorageBucket(); 