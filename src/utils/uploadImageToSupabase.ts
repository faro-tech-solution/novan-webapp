import { supabase } from '@/integrations/supabase/client';

export const uploadFileToSupabase = async (
  file: File, 
  folder: string = 'uploads'
): Promise<string | null> => {
  try {
    console.log('Starting upload for file:', file.name, 'type:', file.type, 'to folder:', folder);
    
    // Generate a unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}_${randomString}.${fileExtension}`;
    const filePath = `${folder}/${fileName}`;

    console.log('Generated file path:', filePath);

    // Check if the bucket exists and is accessible
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return null;
    }
    
    console.log('Available buckets:', buckets?.map(b => b.name));
    
    // Check if 'attachments' bucket exists
    const attachmentsBucket = buckets?.find(b => b.name === 'attachments');
    if (!attachmentsBucket) {
      console.error('Attachments bucket not found. Available buckets:', buckets?.map(b => b.name));
      return null;
    }

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name
      });
      return null;
    }

    console.log('Upload successful, data:', data);

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('attachments')
      .getPublicUrl(filePath);

    console.log('Public URL generated:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadFileToSupabase:', error);
    return null;
  }
};

// Backward compatibility
export const uploadImageToSupabase = uploadFileToSupabase; 