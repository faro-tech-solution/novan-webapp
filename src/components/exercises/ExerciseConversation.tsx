'use client';

import React, { useState, useRef, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/lib/utils";
import { RichTextEditor, FilePreviewList, FileUpload } from "@/components/ui";
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { uploadFileToSupabase } from '@/utils/uploadImageToSupabase';
import { Submission } from "@/types/reviewSubmissions";
import { useSubmissionConversation, useSendConversationMessage, ConversationMessage } from "@/hooks/queries/useExerciseDetailQuery";
import { useGradeSubmissionMutation, useMarkAsViewedMutation } from "@/hooks/queries/useReviewSubmissionsQuery";

interface ExerciseConversationProps {
  submission: Submission;
  variant?: 'full' | 'compact';
  onClose?: () => void; // Add onClose prop
}

export const ExerciseConversation: React.FC<ExerciseConversationProps> = ({
  submission,
  variant = 'full',
  onClose,
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { data: conversation = [], isLoading: conversationLoading } = useSubmissionConversation(submissionId) as { data: ConversationMessage[], isLoading: boolean };

  // Helper function to extract attachments from message content
  const extractAttachments = (messageContent: string): { text: string; attachments: string[] } => {
    const imgRegex = /<img[^>]+src=['"]([^'"]+)['"][^>]*>/g;
    const attachments: string[] = [];
    let match;
    
    while ((match = imgRegex.exec(messageContent)) !== null) {
      attachments.push(match[1]);
    }
    
    // Remove img tags from the text content
    const textContent = messageContent.replace(/<img[^>]*>/g, '');
    
    return { text: textContent, attachments };
  };

  const sendMessageMutation = useSendConversationMessage();
  const gradeSubmissionMutation = useGradeSubmissionMutation();
  const markAsViewedMutation = useMarkAsViewedMutation();

  // Use appropriate mutation based on user role
  const isTrainerOrAdmin = profile?.role === "trainer" || profile?.role === "admin";
  
  // Shared loading state
  const isLoading = sendMessageMutation.isPending || gradeSubmissionMutation.isPending || markAsViewedMutation.isPending || uploading;

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  // Attach click handlers to images in messages
  useEffect(() => {
    if (!messagesContainerRef.current) return;
    const container = messagesContainerRef.current;
    const imgs = container.querySelectorAll('img');
    imgs.forEach(img => {
      img.style.cursor = 'zoom-in';
      img.onclick = (e) => {
        e.stopPropagation();
        setSelectedImage(img.src);
      };
    });
    // Cleanup: remove handlers
    return () => {
      imgs.forEach(img => {
        img.onclick = null;
      });
    };
  }, [conversation]);

  const handleSendMessage = async () => {
    if (!submissionId) return;
    let messageToSend = newMessage;
    const imageUrls: string[] = [];

    console.log('handleSendMessage: isComplete', isComplete);
    
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
              imageUrls.push(fileUrl);
            } else {
              console.error('Upload failed for file:', file.name);
            }
          }
        }
        console.log('All uploads completed. URLs:', imageUrls);
      } catch (error) {
        console.error('Error uploading files:', error);
      } finally {
        setUploading(false);
      }
      
      // Add all files to the message
      if (imageUrls.length > 0) {
        const fileHtml = imageUrls.map(url => {
          const fileName = url.split('/').pop() || 'attachment';
          const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);
          const fileExtension = fileName.split('.').pop()?.toUpperCase() || 'FILE';
          
          if (isImage) {
            return `<br/><img src='${url}' alt='attachment' style='max-width:100px; border-radius:8px; margin-top:8px;' />`;
          } else {
            return `<br/><div style='display: inline-block; background-color: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; padding: 8px 12px; margin-top: 8px; text-align: center; min-width: 80px;'><div style='font-size: 16px; margin-bottom: 4px;'>📎</div><div style='font-size: 12px; font-weight: 500; color: #374151;'>${fileExtension}</div></div>`;
          }
        }).join('');
        messageToSend = `${messageToSend}${fileHtml}`;
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
          
          // Send message to conversation if there's a message
          if (messageToSend.trim()) {
            sendMessageMutation.mutate({ submissionId, message: messageToSend }, {
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
      if (!messageToSend.trim()) return;
      sendMessageMutation.mutate({ submissionId, message: messageToSend }, {
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
    if (!submissionId) return;
    
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

  return (
    <div className={variant === 'compact' ? '' : 'mt-10'}>
      {/* Fullscreen Image Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="flex items-center justify-center bg-black bg-opacity-90 p-0 max-w-full max-h-full" style={{ minHeight: '100vh', minWidth: '100vw' }}>
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 left-4 z-20 bg-white bg-opacity-80 rounded-full p-2 text-black hover:bg-opacity-100"
            aria-label="بستن"
            style={{ fontSize: 24 }}
          >
            ×
          </button>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="نمایش تصویر"
              className="max-w-full max-h-[90vh] object-contain mx-auto my-auto rounded shadow-lg"
              style={{ background: 'white' }}
              onClick={e => e.stopPropagation()}
            />
          )}
        </DialogContent>
      </Dialog>
      
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
            const { text, attachments } = extractAttachments(msg.message);
            
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
                    onImageClick={setSelectedImage}
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
                    onImageClick={setSelectedImage}
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
          <div className="text-gray-400">هنوز پیامی ثبت نشده است.</div>
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
            placeholder="پیام خود را بنویسید..."
            readOnly={isLoading}
            height="120px"
          />
          <FileUpload
            onFileChange={setSelectedFiles}
            disabled={isLoading}
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
            disabled={(!newMessage.trim() && !isTrainerOrAdmin) || isLoading}
          >
            {isLoading ? 'در حال ارسال...' : 'ارسال پاسخ'}
          </button>
        </div>
      </div>
    </div>
  );
}; 