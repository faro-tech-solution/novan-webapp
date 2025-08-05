'use client'

import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  height?: string;
  className?: string;
  toolbar?: any[];
  formats?: string[];
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "متن خود را بنویسید...",
  readOnly = false,
  height = '120px',
  className = '',
  toolbar = [
    ['bold', 'italic', 'underline', 'code'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['code-block'],
    ['clean']
  ],
  formats = [
    'bold', 'italic', 'underline', 'code',
    'list', 'bullet', 'code-block'
  ]
}) => {
  const quillModules = {
    toolbar,
  };

  return (
    <div className="h-[165px] bg-white border-gray-300 border rounded-md overflow-hidden">
      <div className={`${className}`}>
        <style>
          {`
            .ql-editor {
              font-family: 'YekanBakh', sans-serif !important;
            }
            .ql-container {
              font-family: 'YekanBakh', sans-serif !important;
            }
            .ql-toolbar {
              border-top: none !important;
              border-left: none !important;
              border-right: none !important;
              border-bottom: 1px solid #e5e7eb !important;
            }
            .ql-container {
              border: none !important;
            }
            .ql-syntax {
              background: #f5f5f5;
              color: #333;
              font-family: 'Fira Mono', 'Consolas', 'Monaco', monospace;
              font-size: 0.95em;
              padding: 0.5em 1em;
              border-radius: 4px;
              direction: ltr;
              overflow-x: auto;
              text-align: left;
            }
          `}
        </style>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={quillModules}
          formats={formats}
          placeholder={placeholder}
          readOnly={readOnly}
          style={{ height }}
        />
      </div>
    </div>
  );
}; 