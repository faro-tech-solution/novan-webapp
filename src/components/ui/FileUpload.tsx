import React, { useRef, useEffect } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileChange: (files: File[]) => void;
  disabled?: boolean;
  label?: string;
  resetKey?: number;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  showPreview?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileChange,
  disabled = false,
  label = 'افزودن فایل',
  resetKey = 0,
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx',
  multiple = true,
  maxFiles = 5,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset file input when resetKey changes
  useEffect(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [resetKey]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    console.log('FileUpload: Files selected:', files.length, files.map(f => f.name));
    
    if (files.length > maxFiles) {
      alert(`حداکثر ${maxFiles} فایل می‌توانید انتخاب کنید`);
      return;
    }

    onFileChange(files);
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="mt-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md
          hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors duration-200
          ${disabled 
            ? 'opacity-50 cursor-not-allowed bg-gray-100' 
            : 'cursor-pointer bg-white'
          }
        `}
      >
        <Upload className="w-4 h-4" />
        <span>{label}</span>
      </button>
    </div>
  );
}; 