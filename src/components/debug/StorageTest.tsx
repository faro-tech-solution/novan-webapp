'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { uploadFileToSupabase } from '@/utils/uploadImageToSupabase';
import { supabase } from '@/integrations/supabase/client';

export const StorageTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testStorageAccess = async () => {
    setIsLoading(true);
    setTestResult('Testing storage access...\n');
    
    try {
      // Test 1: List buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        setTestResult(prev => prev + `❌ Error listing buckets: ${bucketsError.message}\n`);
        return;
      }
      
      setTestResult(prev => prev + `✅ Buckets found: ${buckets?.map(b => b.name).join(', ')}\n`);
      
      // Test 2: Check if attachments bucket exists
      const attachmentsBucket = buckets?.find(b => b.name === 'attachments');
      if (!attachmentsBucket) {
        setTestResult(prev => prev + `❌ Attachments bucket not found!\n`);
        return;
      }
      
      setTestResult(prev => prev + `✅ Attachments bucket found\n`);
      
      // Test 3: List files in attachments bucket
      const { data: files, error: filesError } = await supabase.storage
        .from('attachments')
        .list('exercise-conversation', {
          limit: 10,
          offset: 0
        });
      
      if (filesError) {
        setTestResult(prev => prev + `❌ Error listing files: ${filesError.message}\n`);
        return;
      }
      
      setTestResult(prev => prev + `✅ Files in exercise-conversation folder: ${files?.length || 0}\n`);
      
      // Test 4: Test file upload with different file types
      const testFiles = [
        new File(['test content'], 'test.txt', { type: 'text/plain' }),
        new File(['test pdf content'], 'test.pdf', { type: 'application/pdf' }),
        new File(['test doc content'], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      ];
      
      for (const testFile of testFiles) {
        const uploadResult = await uploadFileToSupabase(testFile, 'exercise-conversation');
        if (uploadResult) {
          setTestResult(prev => prev + `✅ ${testFile.name} upload successful: ${uploadResult}\n`);
        } else {
          setTestResult(prev => prev + `❌ ${testFile.name} upload failed\n`);
        }
      }
      
              // Test completed
      
    } catch (error) {
      setTestResult(prev => prev + `❌ Unexpected error: ${error}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Supabase Storage Test</h3>
      <Button 
        onClick={testStorageAccess} 
        disabled={isLoading}
        className="mb-4"
      >
        {isLoading ? 'Testing...' : 'Test Storage Access'}
      </Button>
      <pre className="bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap">
        {testResult || 'Click the button to test storage access...'}
      </pre>
    </div>
  );
}; 