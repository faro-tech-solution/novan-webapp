'use client';

import React, { useState, useRef, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/lib/utils";
import { RichTextEditor, FilePreviewList, FileUpload } from "@/components/ui";

import { uploadFileToSupabase } from '@/utils/uploadImageToSupabase';
import { Submission } from "@/types/reviewSubmissions";
import { useSubmissionConversation, useSendConversationMessage, ConversationMessage } from "@/hooks/queries/useExerciseDetailQuery";
import { useGradeSubmissionMutation, useMarkAsViewedMutation } from "@/hooks/queries/useReviewSubmissionsQuery";

interface ExerciseConversationProps {
  submission: Submission;
  variant?: 'full' | 'compact';
  onClose?: () => void; // Add onClose prop
  onExerciseSubmit?: (feedback?: string, attachments?: string[]) => void; // For simple exercise submission
  exerciseSubmitting?: boolean; // Loading state for exercise submission
}

export const ExerciseConversation: React.FC<ExerciseConversationProps> = ({
  submission,
  variant = 'full',
  onClose,
  onExerciseSubmit,
  exerciseSubmitting = false,
}) => {
  const submissionId = submission.id;
  const score = submission.score;
  const studentName = `${submission.student?.first_name ?? ''} ${submission.student?.last_name ?? ''}`;
  const maxScore = submission.exercise?.points ?? 100;
  const [newMessage, setNewMessage] = useState("");
  const [scoreInput, setScoreInput] = useState(score || 0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { profile } = useAuth();
  const isCompleted = submission.score !== null;
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  // Debug: Log when selectedFiles changes
  useEffect(() => {
    console.log('ExerciseConversation: selectedFiles changed:', selectedFiles.length, selectedFiles.map(f => f.name));
  }, [selectedFiles]);
  const [uploading, setUploading] = useState(false);

  const [resetKey, setResetKey] = useState(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Only fetch conversation if submissionId doesn't start with 'temp-submission-'
  const actualSubmissionId = submissionId?.startsWith('temp-submission-') ? undefined : submissionId;
  const { data: conversation = [], isLoading: conversationLoading } = useSubmissionConversation(actualSubmissionId) as { data: ConversationMessage[], isLoading: boolean };

  // Helper function to extract attachments from metadata
  const extractAttachments = (message: ConversationMessage): { text: string; attachments: string[] } => {
    const text = message.message || '';
    
    // Try to get attachments from metadata first
    let attachments: string[] = [];
    if (message.meta_data && typeof message.meta_data === 'object') {
      const metaData = message.meta_data as any;
      if (metaData.attachments && Array.isArray(metaData.attachments)) {
        attachments = metaData.attachments;
      }
    }
    
    // Fallback: extract from message content for old messages
    if (attachments.length === 0) {
      const imgRegex = /<img[^>]+src=['"]([^'"]+)['"][^>]*>/g;
      let match;
      
      while ((match = imgRegex.exec(text)) !== null) {
        attachments.push(match[1]);
      }
    }
    
    // Clean text content by removing img tags and attachment blocks
    const cleanText = text
      .replace(/<img[^>]*>/g, '')
      .replace(/<br\/><div[^>]*>📎<\/div><div[^>]*>[^<]*<\/div><\/div>/g, '')
      .replace(/<br\/>/g, '')
      .trim();
    
    return { text: cleanText, attachments };
  };

  const sendMessageMutation = useSendConversationMessage();
  const gradeSubmissionMutation = useGradeSubmissionMutation();
  const markAsViewedMutation = useMarkAsViewedMutation();

  // Use appropriate mutation based on user role
  const isTrainerOrAdmin = profile?.role === "trainer" || profile?.role === "admin";
  
  // Shared loading state
  const isLoading = sendMessageMutation.isPending || gradeSubmissionMutation.isPending || markAsViewedMutation.isPending || uploading || exerciseSubmitting;

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  // Attach click handlers to images in messages


  const handleSendMessage = async () => {
    // Handle simple exercise submission for temporary submissions
    if (isTemporarySubmission && isSimpleExercise && onExerciseSubmit) {
      // For simple exercises, upload files first then submit
      const attachmentUrls: string[] = [];
      
      if (selectedFiles && selectedFiles.length > 0) {
        setUploading(true);
        try {
          for (const file of selectedFiles) {
            if (file instanceof File) {
              console.log('Uploading file for simple exercise:', file.name);
              const fileUrl = await uploadFileToSupabase(file, 'exercise-conversation');
              if (fileUrl) {
                attachmentUrls.push(fileUrl);
              }
            }
          }
        } catch (error) {
          console.error('Error uploading files for simple exercise:', error);
        } finally {
          setUploading(false);
        }
      }
      
      // Submit exercise with feedback and attachments
      if (onExerciseSubmit) {
        // We need to modify the submission to handle attachments
        // For now, we'll pass the message and store attachments separately
        onExerciseSubmit(newMessage.trim() || undefined, attachmentUrls);
      }
      return;
    }
    
    if (!submissionId || submissionId.startsWith('temp-submission-')) {
      // For other temporary submissions (non-simple exercises), we can't send messages yet
      console.warn('Cannot send conversation message before exercise submission');
      return;
    }
    const messageToSend = newMessage;
    const attachmentUrls: string[] = [];

    console.log('handleSendMessage: Starting with', selectedFiles.length, 'files');
    
    // Upload all files
    if (selectedFiles && selectedFiles.length > 0) {
      setUploading(true);
      try {
        for (const file of selectedFiles) {
          if (file instanceof File) {
            console.log('Uploading file:', file.name);
            const fileUrl = await uploadFileToSupabase(file, 'exercise-conversation');
            if (fileUrl) {
              console.log('Upload successful, URL:', fileUrl);
              attachmentUrls.push(fileUrl);
            } else {
              console.error('Upload failed for file:', file.name);
            }
          }
        }
        console.log('All uploads completed. URLs:', attachmentUrls);
      } catch (error) {
        console.error('Error uploading files:', error);
      } finally {
        setUploading(false);
      }
    }
    
    if (isTrainerOrAdmin) {
      const scoreValue = scoreInput > 0 ? scoreInput : null;
      gradeSubmissionMutation.mutate({
        submissionId,
        score: scoreValue,
      }, {
        onSuccess: () => {
          setNewMessage("");
          setSelectedFiles([]);
          setResetKey(prev => prev + 1); // Force reset of FileUpload component after successful submit
          
          // Send message to conversation if there's a message or attachments
          if (messageToSend.trim() || attachmentUrls.length > 0) {
            sendMessageMutation.mutate({ 
              submissionId, 
              message: messageToSend.trim(), 
              attachments: attachmentUrls 
            }, {
              onSuccess: () => {
                // Close popup after successful operation
                if (onClose) {
                  onClose();
                }
              }
            });
          } else {
            // Close popup after successful operation
            if (onClose) {
              onClose();
            }
          }
        }
      });
    } else {
      if (!messageToSend.trim() && attachmentUrls.length === 0) return;
      sendMessageMutation.mutate({ 
        submissionId, 
        message: messageToSend.trim(), 
        attachments: attachmentUrls 
      }, {
        onSuccess: () => {
          setNewMessage("");
          setSelectedFiles([]);
          setResetKey(prev => prev + 1); // Force reset of FileUpload component after successful submit
          
          // Close popup after successful operation
          if (onClose) {
            onClose();
          }
        }
      });
    }
  };

  const handleMarkAsViewed = async () => {
    if (!submissionId || submissionId.startsWith('temp-submission-')) return;
    
    markAsViewedMutation.mutate({
      submissionId,
    }, {
      onSuccess: () => {
        // Close popup after successful operation
        if (onClose) {
          onClose();
        }
      }
    });
  };

  if (!submissionId) {
    return null;
  }
  
  // Check if this is a temporary submission (before actual submission)
  const isTemporarySubmission = submissionId.startsWith('temp-submission-');
  
  // Check if this is a simple exercise
  const isSimpleExercise = submission.exercise?.exercise_type === 'simple';

  return (
    <div className={variant === 'compact' ? '' : 'mt-10'}>

      
      {variant === 'full' && (
        <h3 className="text-lg font-semibold mb-2">گفتگو درباره این تمرین</h3>
      )}
      {variant === 'compact' && studentName && (
        <h3 className="text-md font-semibold mb-2 flex items-center mt-10">
          گفتگو با {studentName}
        </h3>
      )}
      
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200" ref={messagesContainerRef}>
        {conversationLoading ? (
          <div>در حال بارگذاری گفتگو...</div>
        ) : conversation && conversation.length > 0 ? (
          conversation.map((msg) => {
            const { text, attachments } = extractAttachments(msg);
            
            return msg.sender?.role === 'trainee' ? (
              <div
                key={msg.id}
                className="mr-[40px] mb-[20px] mt-4"
              >
                <div
                  className="bg-white py-4 px-6 border border-gray-200 mt-1 text-sm rounded-[24px] rounded-bl-none"
                >
                  <div dangerouslySetInnerHTML={{ __html: text }} />
                  {/* Attachments section */}
                  <FilePreviewList
                    attachments={attachments}
                    className="mt-3"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-3">
                  <span className="font-bold">{msg.sender?.first_name} {msg.sender?.last_name}</span>
                  <span className="text-[10px] bg-gray-200 rounded px-1">دانشجو</span>
                  <span>{formatDate({dateString: msg.created_at})}</span>
                </div>
              </div>
            ) : (
              <div key={msg.id} className="ml-[40px] mb-[20px] mt-4">
                <div className="bg-blue-50 py-4 px-6 border border-blue-200 mt-1 text-sm rounded-[24px] rounded-br-none">
                  <div dangerouslySetInnerHTML={{ __html: text }} />
                  {/* Attachments section */}
                  <FilePreviewList
                    attachments={attachments}
                    className="mt-3"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-3">
                  <span className="font-bold">{msg.sender?.first_name} {msg.sender?.last_name}</span>
                  <span className="text-[10px] bg-gray-200 rounded px-1">{msg.sender?.role}</span>
                  <span>{formatDate({dateString: msg.created_at})}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-gray-400">
            {isTemporarySubmission 
              ? (isSimpleExercise 
                  ? "برای تکمیل این تمرین، پیام خود را در زیر بنویسید و ارسال کنید." 
                  : "پس از ارسال تمرین، می‌توانید در اینجا با مربی گفتگو کنید.")
              : "هنوز پیامی ثبت نشده است."
            }
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Submission Status Notification for Trainees (only in full mode) */}
      {variant === 'full' && profile?.role === "trainee" && isCompleted && (
        <Alert className="border-green-200 bg-green-50 mt-4">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            تمرین قبلا ارسال شده است. شما این تمرین را با موفقیت تکمیل
            کرده‌اید.
            {score !== null && score !== undefined && (
              <span className="font-semibold">
                {" "}
                نمره دریافتی: {score}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Score Input for Trainers/Admins */}
      {isTrainerOrAdmin && (
        <div className="mt-8 mb-8">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">
              نمره (از 0 تا {maxScore})
            </label>
            <span className="text-sm font-semibold text-teal-600 ml-20">
              {scoreInput}
            </span>
          </div>
          <div className="ml-20">
            <Slider
              value={[scoreInput]}
              onValueChange={(value) => setScoreInput(value[0])}
              max={maxScore}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      )}
      
      <div className="flex gap-2 mt-2 items-end">
        <div className="flex-1">
          <RichTextEditor
            value={newMessage}
            onChange={setNewMessage}
            placeholder={isTemporarySubmission 
              ? (isSimpleExercise 
                  ? "برای تکمیل تمرین، پیام خود را بنویسید..." 
                  : "ابتدا تمرین را ارسال کنید...")
              : "پیام خود را بنویسید..."
            }
            readOnly={isLoading || (isTemporarySubmission && !isSimpleExercise)}
            height="120px"
          />
          <FileUpload
            onFileChange={setSelectedFiles}
            disabled={isLoading || (isTemporarySubmission && !isSimpleExercise)}
            label={uploading ? 'در حال آپلود...' : 'افزودن فایل'}
            resetKey={resetKey}
          />
          <FilePreviewList
            attachments={[]}
            files={selectedFiles}
            showRemoveButton={true}
            onRemove={(index) => {
              const newFiles = selectedFiles.filter((_, i) => i !== index);
              setSelectedFiles(newFiles);
            }}
            className="mt-2"
          />
        </div>
        <div className="flex flex-col gap-2 w-40"> {/* Stack buttons vertically */}
          {isTrainerOrAdmin && (
            <>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50 w-full"
                onClick={handleMarkAsViewed}
                disabled={isLoading}
              >
                {isLoading ? 'در حال بروزرسانی...' : 'مشاهده شد'}
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 w-full"
                onClick={() => handleSendMessage()}
                disabled={isLoading}
              >
                {isLoading
                  ? 'در حال ارسال...'
                  : score
                    ? 'بروزرسانی نمره'
                    : 'ارسال و تکمیل'}
              </button>
            </>
          )}
          <button
            className="bg-teal-600 text-white px-4 py-2 rounded disabled:opacity-50 w-full"
            onClick={() => handleSendMessage()}
            disabled={(!newMessage.trim() && !isTrainerOrAdmin) || isLoading || (isTemporarySubmission && !isSimpleExercise)}
          >
            {isLoading 
              ? 'در حال ارسال...' 
              : isTemporarySubmission 
                ? (isSimpleExercise ? 'تکمیل تمرین' : 'ابتدا تمرین را ارسال کنید')
                : 'ارسال پاسخ'
            }
          </button>
        </div>
      </div>
    </div>
  );
}; 