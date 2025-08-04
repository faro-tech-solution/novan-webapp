# File Upload Debug Guide - Exercise Conversation

## Issue Description
File upload functionality is not working in the exercise conversation component.

## Potential Issues and Solutions

### 1. **Supabase Storage Bucket Issues**

#### **Problem**: The 'attachments' bucket doesn't exist
- **Symptoms**: Upload fails with bucket not found errors
- **Solution**: Create the bucket using the setup script

#### **Problem**: Bucket permissions are incorrect
- **Symptoms**: Upload fails with permission errors
- **Solution**: Ensure bucket is public and has correct policies

#### **Problem**: Folder structure doesn't exist
- **Symptoms**: Upload fails when trying to create files in non-existent folders
- **Solution**: Create the 'exercise-conversation' folder

### 2. **File Upload Component Issues**

#### **Problem**: File selection not working
- **Symptoms**: No files are selected when clicking the upload button
- **Solution**: Check browser console for JavaScript errors

#### **Problem**: File validation issues
- **Symptoms**: Files are selected but not processed
- **Solution**: Check file type and size restrictions

### 3. **Network/API Issues**

#### **Problem**: Supabase client configuration
- **Symptoms**: Network errors or authentication failures
- **Solution**: Verify Supabase URL and API keys

#### **Problem**: CORS issues
- **Symptoms**: Upload fails with CORS errors
- **Solution**: Check Supabase storage CORS configuration

## Debug Steps

### Step 1: Check Browser Console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Try to upload a file
4. Look for any error messages

### Step 2: Test Storage Access
1. Navigate to an exercise detail page
2. Look for the "Storage Test" component
3. Click "Test Storage Access" button
4. Check the results

### Step 3: Check File Selection
1. Try selecting a file using the upload button
2. Check if the file selection dialog opens
3. Verify if files are being added to the state

### Step 4: Check Upload Process
1. Select a file and try to send a message
2. Check console logs for upload progress
3. Verify if upload URLs are generated

## Debug Components Added

### 1. **StorageTest Component**
- **Location**: `src/components/debug/StorageTest.tsx`
- **Purpose**: Test Supabase storage access and bucket configuration
- **Usage**: Added to exercise detail page for testing

### 2. **Enhanced Logging**
- **FileUpload Component**: Added console logs for file selection
- **ExerciseConversation Component**: Added logs for file state changes and upload process
- **uploadImageToSupabase**: Added detailed error logging and bucket checking

### 3. **Visual Indicators**
- **File Selection**: Shows selected file names
- **Upload Status**: Shows upload progress and status

## Setup Script

### **Storage Bucket Setup**
- **Script**: `scripts/setup-storage-bucket.js`
- **Purpose**: Create and configure the attachments bucket
- **Usage**: Run with Supabase service role key

```bash
# Set your Supabase service role key
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run the setup script
node scripts/setup-storage-bucket.js
```

## Common Error Messages and Solutions

### **"Bucket not found"**
```javascript
// Solution: Create the bucket
const { data, error } = await supabase.storage.createBucket('attachments', {
  public: true,
  allowedMimeTypes: ['image/*', 'application/pdf', 'text/*']
});
```

### **"Permission denied"**
```javascript
// Solution: Check bucket policies in Supabase dashboard
// Ensure bucket is public or user has proper permissions
```

### **"File too large"**
```javascript
// Solution: Check file size limits
// Default limit is 50MB, can be configured in bucket settings
```

### **"Invalid file type"**
```javascript
// Solution: Check allowed MIME types
// Current allowed types: image/*, application/pdf, text/*
```

## Testing Checklist

- [ ] Storage bucket exists and is accessible
- [ ] File selection dialog opens
- [ ] Files are added to state when selected
- [ ] Upload process starts when sending message
- [ ] Files are uploaded to Supabase storage
- [ ] Upload URLs are generated correctly
- [ ] Images are displayed in conversation
- [ ] Image zoom functionality works

## Next Steps

1. **Run the storage test** to identify bucket issues
2. **Check browser console** for JavaScript errors
3. **Verify file selection** is working
4. **Test upload process** with small image files
5. **Check Supabase dashboard** for storage configuration
6. **Run setup script** if bucket doesn't exist

## Files Modified for Debugging

1. **`src/utils/uploadImageToSupabase.ts`** - Enhanced error logging
2. **`src/components/ui/FileUpload.tsx`** - Added file selection logging
3. **`src/components/exercises/ExerciseConversation.tsx`** - Added upload process logging
4. **`src/components/debug/StorageTest.tsx`** - New debug component
5. **`src/pages/exercises/ExerciseDetail.tsx`** - Added debug component
6. **`scripts/setup-storage-bucket.js`** - New setup script 