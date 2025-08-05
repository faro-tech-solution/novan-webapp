import React, { useState, useRef, useEffect } from 'react';
import { formatDate } from '@/lib/utils';
import { Calendar } from 'lucide-react';
import { RichTextEditor, FilePreviewList, FileUpload } from '@/components/ui';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { uploadImageToSupabase } from '@/utils/uploadImageToSupabase';

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  attachments: string[] | null;
  created_at: string;
}

type TicketMessageWithSender = TicketMessage & {
  sender?: { id: string; first_name: string; last_name: string; role: string; };
};

interface TicketConversationProps {
  description: string;
  messages: TicketMessageWithSender[];
  onSend: (message: string, attachments?: string[]) => void;
  disabled?: boolean;
  userMap?: Record<string, string>;
}

export default function TicketConversation({ description, messages, onSend, disabled, userMap = {} }: TicketConversationProps) {
  const [message, setMessage] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() && (!imageFiles || imageFiles.length === 0)) return;
    setUploading(true);
    const messageToSend = message;
    const attachments: string[] = [];
    
    try {
      // Upload files first
      for (const file of imageFiles) {
        const imageUrl = await uploadImageToSupabase(file, 'ticket-conversation');
        if (imageUrl) {
          attachments.push(imageUrl);
        }
      }
      
      // Send message and wait for it to complete
      await onSend(messageToSend.trim(), attachments);
      
      // Reset only after successful send
      setMessage('');
      setImageFiles([]);
      setResetKey(prev => prev + 1); // Force reset of ImageUpload component after successful submit
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-lg p-3 min-h-[350px] overflow-y-auto mb-3">
      <div className="min-h-[120px]">
        {/* Fullscreen Image Dialog */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="flex items-center justify-center bg-black bg-opacity-90 p-0 max-w-full max-h-full" style={{ minHeight: '100vh', minWidth: '100vw' }}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 left-4 z-20 bg-white bg-opacity-80 rounded-full p-2 text-black hover:bg-opacity-100"
              aria-label="Close"
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
        
        {/* Ticket description as the first message */}
        {description && (
          <div className="border border-gray-200 bg-gray-50 inline-block px-3 py-2 rounded-md mt-1 w-full max-w-[80%]">
            {/* WARNING: Only use dangerouslySetInnerHTML with trusted/sanitized HTML to avoid XSS vulnerabilities */}
            <div
              className="inline-block px-3 py-2 rounded-md mt-1 font-medium"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        )}
        
        {messages.map(msg => {
          const isTrainee = msg.sender?.role === 'trainee';
          // Prefer sender info from join, fallback to userMap, then sender_id
          const senderName = msg.sender
            ? [msg.sender.first_name, msg.sender.last_name].filter(Boolean).join(' ')
            : (userMap[msg.sender_id] || msg.sender_id);
          // Parse attachments (array of URLs)
          let attachments: string[] = [];
          if (msg.attachments) {
            if (Array.isArray(msg.attachments)) {
              attachments = msg.attachments;
            } else if (typeof msg.attachments === 'string') {
              try {
                attachments = JSON.parse(msg.attachments);
              } catch {
                attachments = [];
              }
            }
          }
          return (
            <div key={msg.id} className="mt-5">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3 inline-block mr-1" />
                {formatDate({dateString: msg.created_at})}
                <span className="ml-2 text-gray-700 font-semibold">{senderName}</span>
              </div>
              <div
                className={
                  (isTrainee
                    ? 'border-gray-200 bg-gray-50'
                    : 'border-blue-200 bg-blue-50') +
                  ' border max-w-[80%] inline-block px-3 py-2 rounded-md mt-1 w-full'
                }
              >
                <div
                className="inline-block px-3 py-2 rounded-md mt-1 font-medium"
                dangerouslySetInnerHTML={{ __html: msg.message }}
                />
                {/* Attachments section */}
                <FilePreviewList
                  attachments={attachments}
                  onImageClick={setSelectedImage}
                  imageSize="lg"
                  className="mt-2"
                />
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2 mt-10 items-end">
        <div className="flex-1">
          <RichTextEditor
            value={message}
            onChange={setMessage}
            placeholder={disabled ? 'Ticket closed' : 'Type a message...'}
            readOnly={disabled || uploading}
            height="120px"
          />
          <FileUpload
            onFileChange={files => setImageFiles(files || [])}
            disabled={disabled || uploading}
            label={uploading ? 'Uploading...' : 'Attach files'}
            resetKey={resetKey}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={disabled || uploading || (!message.trim() && (!imageFiles || imageFiles.length === 0))}
          className="px-4 py-2 rounded bg-blue-500 text-white disabled:bg-gray-300 disabled:cursor-not-allowed h-12 mt-2"
        >
          {uploading ? 'Uploading...' : 'Send'}
        </button>
      </div>
    </div>
  );
} 