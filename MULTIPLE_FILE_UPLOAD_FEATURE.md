# Multiple File Upload Feature - Exercise Conversations

## Overview
Enhanced the file upload functionality in exercise conversations to support multiple file types with preview capabilities.

## Supported File Types

### 📁 **Images**
- **Formats**: JPG, JPEG, PNG, GIF, WebP, SVG
- **Preview**: Thumbnail preview with zoom functionality
- **Display**: Inline image display in messages

### 📄 **Documents**
- **PDF**: Portable Document Format
- **Word**: .doc, .docx files
- **Excel**: .xls, .xlsx files  
- **PowerPoint**: .ppt, .pptx files
- **Preview**: File icon with type and size information
- **Display**: Downloadable links in messages

### 📝 **Text Files**
- **Formats**: .txt, .md, .json, etc.
- **Preview**: File icon with type information
- **Display**: Downloadable links in messages

## Features Implemented

### ✅ **Multiple File Selection**
- Select multiple files at once
- Drag and drop support
- File type validation
- File size limits (50MB per file)

### ✅ **File Preview System**
- **Images**: Thumbnail previews with zoom
- **Documents**: File type icons with extension display
- **Clean Design**: No file names, only file type indicators
- **Remove Option**: Individual file removal before upload

### ✅ **Enhanced Upload Process**
- **Progress Tracking**: Visual upload status
- **Error Handling**: Detailed error messages
- **File Type Detection**: Automatic MIME type handling
- **URL Generation**: Public download links

### ✅ **Message Integration**
- **Images**: Inline display in conversation
- **Documents**: Gray attachment blocks with file extension
- **Mixed Content**: Support for text + files in same message

## Technical Implementation

### **FileUpload Component**
```typescript
interface FileUploadProps {
  onFileChange: (files: File[]) => void;
  disabled?: boolean;
  label?: string;
  resetKey?: number;
  accept?: string; // 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx'
  multiple?: boolean;
  maxFiles?: number;
  showPreview?: boolean;
}
```

### **FilePreviewList Component**
```typescript
interface FilePreviewListProps {
  attachments: string[]; // Uploaded file URLs
  files?: File[]; // Selected files before upload
  onImageClick?: (imageUrl: string) => void;
  onRemove?: (index: number) => void;
  className?: string;
  imageSize?: 'sm' | 'md' | 'lg';
  showRemoveButton?: boolean;
}
```

### **Upload Function**
```typescript
export const uploadFileToSupabase = async (
  file: File, 
  folder: string = 'uploads'
): Promise<string | null>
```

## File Type Icons

### **Document Icons**
- 📄 **PDF**: PDF documents
- 📝 **Word**: Word documents (.doc, .docx)
- 📊 **Excel**: Excel spreadsheets (.xls, .xlsx)
- 📈 **PowerPoint**: PowerPoint presentations (.ppt, .pptx)
- 🖼️ **Images**: Image files
- 📎 **Other**: Generic file icon

## User Experience

### **File Selection Process**
1. **Click "افزودن فایل"** button
2. **Select multiple files** from file dialog
3. **Preview files** before upload
4. **Remove unwanted files** if needed
5. **Send message** to upload and attach files

### **File Display in Messages**
- **Images**: Display as thumbnails with zoom capability
- **Documents**: Show as gray attachment blocks with file extension
- **Mixed Content**: Text + files in same message

### **File Management**
- **Before Upload**: Preview and remove files
- **After Upload**: Files are permanently attached to message
- **Download**: Click links to download files

## Storage Configuration

### **Supabase Storage Bucket**
- **Bucket Name**: `attachments`
- **Folder Structure**: `exercise-conversation/`
- **Public Access**: Files are publicly accessible
- **File Size Limit**: 50MB per file

### **Allowed MIME Types**
```javascript
[
  'image/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/*'
]
```

## Setup Instructions

### **1. Storage Bucket Setup**
```bash
# Set your Supabase service role key
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run the setup script
node scripts/setup-storage-bucket.js
```

### **2. Component Usage**
```typescript
import { FileUpload, FilePreviewList } from '@/components/ui';
import { uploadFileToSupabase } from '@/utils/uploadImageToSupabase';

// In your component
const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

<FileUpload
  onFileChange={setSelectedFiles}
  multiple={true}
  maxFiles={5}
  showPreview={true}
/>

<FilePreviewList
  files={selectedFiles}
  showRemoveButton={true}
  onRemove={(index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  }}
/>
```

## Error Handling

### **Common Issues**
- **File too large**: Check file size limits
- **Invalid file type**: Verify MIME type is allowed
- **Upload failed**: Check network connection and storage permissions
- **Preview not working**: Ensure file is valid image format

### **Debug Tools**
- **StorageTest Component**: Test storage access and upload functionality
- **Console Logging**: Detailed upload process logging
- **Error Messages**: User-friendly error feedback

## Security Considerations

### **File Validation**
- **MIME Type Checking**: Server-side validation
- **File Size Limits**: Prevent large file uploads
- **File Extension Validation**: Additional security layer

### **Access Control**
- **Public Files**: All uploaded files are publicly accessible
- **URL Security**: Files are served via Supabase CDN
- **No Authentication**: Files can be accessed by anyone with the URL

## Performance Optimizations

### **Upload Optimization**
- **Parallel Uploads**: Multiple files uploaded simultaneously
- **Progress Tracking**: Real-time upload status
- **Error Recovery**: Individual file error handling

### **Display Optimization**
- **Lazy Loading**: Images loaded on demand
- **Thumbnail Generation**: Optimized image previews
- **Caching**: Browser-level file caching

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

- [ ] Multiple file selection works
- [ ] File preview displays correctly
- [ ] File removal before upload works
- [ ] Upload process completes successfully
- [ ] Files display correctly in messages
- [ ] Image zoom functionality works
- [ ] Document links are clickable
- [ ] Error handling works properly
- [ ] File type validation works
- [ ] File size limits are enforced 