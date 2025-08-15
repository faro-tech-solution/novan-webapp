
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { FileUpload } from '@/components/ui/FileUpload';
import { FilePreviewList } from '@/components/ui/FilePreviewList';
import { UseFormReturn } from 'react-hook-form';
import { CreateExerciseFormData } from './CreateExerciseForm';
import { useState } from 'react';

interface BasicInfoSectionProps {
  form: UseFormReturn<CreateExerciseFormData>;
  selectedFiles?: File[];
  onSelectedFilesChange?: (files: File[]) => void;
}

export const BasicInfoSection = ({ 
  form, 
  selectedFiles = [], 
  onSelectedFilesChange 
}: BasicInfoSectionProps) => {
  const handleFileChange = (files: File[]) => {
    onSelectedFilesChange?.(files);
  };

  const handleRemoveSelectedFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    onSelectedFilesChange?.(newFiles);
  };

  const handleRemoveAttachment = (index: number) => {
    const currentAttachments = form.getValues('attachments') || [];
    const newAttachments = currentAttachments.filter((_, i) => i !== index);
    form.setValue('attachments', newAttachments);
  };

  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>عنوان تمرین</FormLabel>
            <FormControl>
              <Input 
                placeholder="مثال: مبانی React Hooks" 
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>توضیحات</FormLabel>
            <FormControl>
              <RichTextEditor 
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="توضیحات کاملی از تمرین ارائه دهید..."
                height="120px"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="attachments"
        render={({ field }) => (
          <FormItem>
            <FormLabel>فایل‌های پیوست</FormLabel>
            <FormControl>
              <div className="space-y-4">
                <FileUpload
                  onFileChange={handleFileChange}
                  disabled={false}
                  label="انتخاب فایل‌ها"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md"
                  multiple={true}
                  maxFiles={10}
                />

                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">فایل‌های انتخاب شده (قبل از آپلود):</h4>
                    <FilePreviewList
                      files={selectedFiles}
                      attachments={[]}
                      showRemoveButton={true}
                      onRemove={handleRemoveSelectedFile}
                    />
                  </div>
                )}

                {field.value && field.value.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">فایل‌های آپلود شده:</h4>
                    <FilePreviewList
                      attachments={field.value}
                      showRemoveButton={true}
                      onRemove={handleRemoveAttachment}
                    />
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
