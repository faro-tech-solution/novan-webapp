'use client'

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-32 w-full animate-pulse bg-muted rounded-md" />
})

// Import Quill styles
import 'react-quill/dist/quill.snow.css'

export interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  readOnly?: boolean
  modules?: any
  formats?: string[]
  theme?: 'snow' | 'bubble'
  height?: string | number
  error?: boolean
  disabled?: boolean
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing...',
  className,
  readOnly = false,
  modules,
  formats,
  theme = 'snow',
  height = '200px',
  error = false,
  disabled = false
}) => {
  // Default modules configuration
  const defaultModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    },
  }), [])

  // Default formats
  const defaultFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'indent',
    'align',
    'link', 'image', 'video'
  ]

  const editorModules = modules || defaultModules
  const editorFormats = formats || defaultFormats

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'border rounded-md transition-colors',
          error 
            ? 'border-destructive focus-within:border-destructive' 
            : 'border-input focus-within:border-ring',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <ReactQuill
          theme={theme}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly || disabled}
          modules={editorModules}
          formats={editorFormats}
          style={{ height }}
          className={cn(
            'rich-text-editor',
            error && 'border-destructive'
          )}
        />
      </div>
      {error && (
        <p className="text-sm text-destructive mt-1">
          This field is required
        </p>
      )}
    </div>
  )
}

export default RichTextEditor 