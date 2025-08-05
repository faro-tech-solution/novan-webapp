import React from 'react';
import { X } from 'lucide-react';

interface FilePreviewListProps {
  attachments: string[];
  files?: File[];
  onImageClick?: (imageUrl: string) => void;
  onRemove?: (index: number) => void;
  className?: string;
  imageSize?: 'sm' | 'md' | 'lg';
  showRemoveButton?: boolean;
}

export const FilePreviewList: React.FC<FilePreviewListProps> = ({
  attachments,
  files,
  onImageClick,
  onRemove,
  className = '',
  imageSize = 'md',
  showRemoveButton = false
}) => {
  if ((!attachments || attachments.length === 0) && (!files || files.length === 0)) {
    return null;
  }

  const getImageSizeClasses = () => {
    switch (imageSize) {
      case 'sm':
        return 'w-16 h-16';
      case 'lg':
        return 'w-24 h-24';
      default:
        return 'w-20 h-20';
    }
  };

  const isImageFile = (url: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📈';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'svg':
        return '🖼️';
      default:
        return '📎';
    }
  };

  const getFileExtension = (fileName: string) => {
    return fileName.toLowerCase().split('.').pop()?.toUpperCase() || 'FILE';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Show uploaded attachments (URLs) */}
      {attachments && attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((attachment, index) => {
            const isImage = isImageFile(attachment);
            const fileName = attachment.split('/').pop() || `attachment-${index + 1}`;
            
            return (
              <div key={`attachment-${index}`} className="relative group">
                {isImage ? (
                  <img
                    src={attachment}
                    alt={`Attachment ${index + 1}`}
                    className={`
                      ${getImageSizeClasses()} 
                      object-cover rounded-md border border-gray-200
                      ${onImageClick ? 'cursor-zoom-in hover:opacity-80' : ''}
                      transition-opacity duration-200
                    `}
                    onClick={() => onImageClick?.(attachment)}
                  />
                ) : (
                  <div className={`
                    ${getImageSizeClasses()} 
                    bg-gray-100 border border-gray-200 rounded-md
                    flex flex-col items-center justify-center
                    text-xs text-gray-600 p-2
                  `}>
                    <div className="text-lg mb-1">{getFileIcon(fileName)}</div>
                    <div className="text-center text-xs">
                      <div className="font-medium text-gray-700">{getFileExtension(fileName)}</div>
                    </div>
                  </div>
                )}
                
                {showRemoveButton && onRemove && (
                  <button
                    onClick={() => onRemove(index)}
                    className="
                      absolute -top-2 -right-2 
                      bg-red-500 text-white rounded-full p-1
                      opacity-0 group-hover:opacity-100
                      transition-opacity duration-200
                      hover:bg-red-600
                    "
                    aria-label="Remove attachment"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Show selected files (before upload) */}
      {files && files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, index) => {
            const isImage = file.type.startsWith('image/');
            const fileName = file.name;
            
            return (
              <div key={`file-${index}`} className="relative group">
                {isImage ? (
                  <div className={`
                    ${getImageSizeClasses()} 
                    bg-gray-100 border border-gray-200 rounded-md
                    flex flex-col items-center justify-center
                    overflow-hidden
                  `}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                                         {/* No file name overlay for images */}
                  </div>
                ) : (
                  <div className={`
                    ${getImageSizeClasses()} 
                    bg-gray-100 border border-gray-200 rounded-md
                    flex flex-col items-center justify-center
                    text-xs text-gray-600 p-2
                  `}>
                    <div className="text-lg mb-1">{getFileIcon(fileName)}</div>
                    <div className="text-center text-xs">
                      <div className="font-medium text-gray-700">{getFileExtension(fileName)}</div>
                    </div>
                  </div>
                )}
                
                {showRemoveButton && onRemove && (
                  <button
                    onClick={() => onRemove(index)}
                    className="
                      absolute -top-2 -right-2 
                      bg-red-500 text-white rounded-full p-1
                      opacity-0 group-hover:opacity-100
                      transition-opacity duration-200
                      hover:bg-red-600
                    "
                    aria-label="Remove file"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}; 