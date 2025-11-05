# Exercise File Upload Implementation

## Overview
Implemented file upload functionality for exercise creation and editing in the admin dashboard. Users can now attach files to exercises, which are stored in the exercise metadata as an `attachments` array.

## Features Implemented

### ✅ **File Upload in Exercise Forms**
- **FileUpload Component**: Generic file upload component with preview
- **Multiple File Support**: Upload up to 10 files per exercise
- **File Type Validation**: Supports images, PDFs, documents, spreadsheets, presentations, and text files
- **File Preview**: Preview files before upload with remove functionality
- **Upload Progress**: Visual feedback during upload process

### ✅ **Metadata Storage**
- **Attachments Array**: Files are stored in exercise metadata as `attachments: []`
- **URL Storage**: File URLs are stored as strings in the metadata
- **Backward Compatibility**: Existing exercises without attachments continue to work

### ✅ **File Display**
- **Exercise Detail View**: Attachments are displayed in exercise detail pages
- **FilePreviewList Component**: Reusable component for displaying uploaded files
- **Image Preview**: Images are displayed as thumbnails with zoom capability
- **Document Icons**: Non-image files show appropriate file type icons

## Technical Implementation

### **Database Schema**
```sql
-- Attachments are stored in the metadata JSON field
metadata: {
  "attachments": ["url1", "url2", "url3"],
}
```

### **Type Definitions**
```typescript
// Exercise interface updated
interface Exercise {
  // ... existing fields
  attachments?: string[]; // Array of uploaded file URLs
}

// ExerciseDetail interface updated
interface ExerciseDetail {
  // ... existing fields
  attachments?: string[]; // Array of uploaded file URLs
}
```

### **Form Schema**
```typescript
const formSchema = z.object({
  // ... existing fields
  attachments: z.array(z.string()).default([]), // Array of uploaded file URLs
});
```

### **Service Updates**
- **exerciseCreateService**: Handles attachments in metadata during creation
- **exerciseUpdateService**: Handles attachments in metadata during updates
- **exerciseDetailService**: Extracts attachments from metadata for display
- **exerciseFetchService**: Extracts attachments from metadata for lists

## Components Updated

### **CreateExerciseForm**
- Added `attachments` field to form schema
- Updated default values to include empty attachments array

### **BasicInfoSection**
- Added FileUpload component for file selection
- Added FilePreviewList for uploaded files display
- Added upload functionality with progress tracking
- Added file removal functionality

### **ExerciseDetail**
- Added attachments display section
- Uses FilePreviewList component for consistent display

### **Mutation Hooks**
- Updated `useCreateExerciseMutation` to include attachments
- Updated `useUpdateExerciseMutation` to include attachments

## File Upload Process

### **1. File Selection**
- User clicks "انتخاب فایل‌ها" button
- File dialog opens with supported file types
- Multiple files can be selected (up to 10)

### **2. File Preview (Before Upload)**
- Selected files are displayed in "فایل‌های انتخاب شده (قبل از آپلود)" section
- Images show thumbnails
- Documents show file type icons
- Remove button available for each selected file
- Files are NOT uploaded yet - they're just selected

### **3. Form Submission & Upload**
- When user clicks "ذخیره تغییرات" or "ایجاد تمرین"
- Selected files are uploaded to Supabase Storage in `exercise-attachments` folder
- Upload progress and success/error messages displayed via toast notifications
- Uploaded file URLs are added to form's attachments array

### **4. Database Storage**
- Files are stored in exercise metadata as `attachments: []` array
- File URLs are saved to database when exercise is created/updated
- Existing uploaded files are preserved and displayed in "فایل‌های آپلود شده" section

## Supported File Types

### **Images**
- JPG, JPEG, PNG, GIF, WebP, SVG
- Displayed as thumbnails with zoom capability

### **Documents**
- PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PowerPoint (.ppt, .pptx)
- Displayed with file type icons

### **Text Files**
- .txt, .md, .json, etc.
- Displayed with generic file icon

## Storage Configuration

### **Supabase Storage**
- **Bucket**: `attachments`
- **Folder**: `exercise-attachments/`
- **Public Access**: Files are publicly accessible
- **File Size Limit**: 50MB per file (configured in Supabase)

### **File Naming**
- Unique filenames generated with timestamp and random string
- Format: `{timestamp}_{randomString}.{extension}`

## Error Handling

### **Upload Errors**
- File size validation
- File type validation
- Network error handling
- Storage permission errors

### **User Feedback**
- Toast notifications for success/error states
- Progress indicators during upload
- Clear error messages

## Security Considerations

### **File Validation**
- MIME type checking
- File extension validation
- File size limits

### **Access Control**
- Files are publicly accessible via URLs
- No authentication required for file access
- URLs are generated by Supabase CDN

## Usage Examples

### **Creating Exercise with Attachments**
```typescript
const exerciseData = {
  title: "تمرین با فایل‌های پیوست",
  description: "توضیحات تمرین",
  // ... other fields
  attachments: [
    "https://supabase.co/storage/v1/object/public/attachments/exercise-attachments/1234567890_abc123.pdf",
    "https://supabase.co/storage/v1/object/public/attachments/exercise-attachments/1234567891_def456.jpg"
  ]
};
```

### **Displaying Attachments**
```typescript
<FilePreviewList
  attachments={exercise.attachments}
  showRemoveButton={false}
  imageSize="lg"
/>
```

## Future Enhancements

### **Planned Features**
- **File Compression**: Automatic image compression
- **Batch Operations**: Bulk file management
- **Advanced Preview**: Document preview for PDFs
- **File Versioning**: Multiple versions of same file
- **Access Control**: Private file sharing options

### **Integration Opportunities**
- **Cloud Storage**: Additional storage providers
- **File Processing**: Automatic file conversion
- **OCR Support**: Text extraction from images
- **Virus Scanning**: File security scanning

## Testing Checklist

- [ ] File selection works in exercise creation form
- [ ] File selection works in exercise edit form
- [ ] Multiple files can be selected
- [ ] Selected files are displayed in preview section
- [ ] File removal works for selected files (before upload)
- [ ] Files are uploaded only when form is submitted
- [ ] Upload progress and success/error messages display correctly
- [ ] Uploaded files appear in the "فایل‌های آپلود شده" section
- [ ] File removal works for uploaded files
- [ ] Attachments display in exercise detail view
- [ ] File type validation works
- [ ] File size limits are enforced
- [ ] Existing exercises without attachments work correctly
- [ ] Metadata is stored correctly in database
- [ ] Attachments are retrieved correctly from database
