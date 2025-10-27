'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { useExerciseQuestions, useQuestionReplies, useCreateQuestion, useCreateReply, useVoteQuestion } from '@/hooks/queries/useExerciseQA';
import { ExerciseQuestion } from '@/types/exerciseQA';
import { ExerciseDetail } from '@/types/exercise';
import { MessageSquare, ChevronDown, ChevronUp, Reply as ReplyIcon, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { faIR } from 'date-fns/locale';

interface QATabProps {
  exercise: ExerciseDetail;
}

export const QATab: React.FC<QATabProps> = ({ exercise }) => {
  const { data: questions = [], isLoading } = useExerciseQuestions(exercise.id, exercise.course_id, exercise.exercise_type !== 'form' && exercise.exercise_type !== 'simple');
  const createQuestionMutation = useCreateQuestion();
  const voteMutation = useVoteQuestion();

  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionContent, setNewQuestionContent] = useState('');
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  const handleCreateQuestion = () => {
    if (!newQuestionTitle.trim() || !newQuestionContent.trim()) return;
    
    createQuestionMutation.mutate(
      {
        exercise_id: exercise.id,
        course_id: exercise.course_id,
        title: newQuestionTitle,
        content: newQuestionContent,
        parent_id: null,
      },
      {
        onSuccess: () => {
          setNewQuestionTitle('');
          setNewQuestionContent('');
          setIsQuestionDialogOpen(false);
        },
      }
    );
  };

  const toggleReplies = (questionId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedReplies(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">پرسش و پاسخ</h3>
        <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
          <DialogTrigger asChild>
            <Button>سوال بپرسید </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>سوال جدید</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان سوال *
                </label>
                <input
                  type="text"
                  value={newQuestionTitle}
                  onChange={(e) => setNewQuestionTitle(e.target.value)}
                  placeholder="عنوان سوال خود را وارد کنید..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={200}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  متن سوال *
                </label>
                <RichTextEditor
                  value={newQuestionContent}
                  onChange={setNewQuestionContent}
                  placeholder="سوال خود را بنویسید..."
                  height="150px"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsQuestionDialogOpen(false)}>
                  انصراف
                </Button>
                <Button
                  onClick={handleCreateQuestion}
                  disabled={!newQuestionTitle.trim() || !newQuestionContent.trim() || createQuestionMutation.isPending}
                >
                  {createQuestionMutation.isPending ? 'در حال ثبت...' : 'ثبت سوال'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">هنوز سوالی پرسیده نشده است</p>
            <p className="text-sm text-gray-500 mt-2">اولین نفری باشید که سوال می‌پرسد</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              exercise={exercise}
              isExpanded={expandedReplies.has(question.id)}
              onToggleExpand={() => toggleReplies(question.id)}
              onVote={(voteType) => voteMutation.mutate({ questionId: question.id, voteType })}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface QuestionCardProps {
  question: ExerciseQuestion;
  exercise: ExerciseDetail;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onVote: (voteType: 'upvote' | 'downvote') => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, exercise, isExpanded, onToggleExpand, onVote }) => {
  const { data: replies = [], isLoading: repliesLoading } = useQuestionReplies(question.id, isExpanded);
  const createReplyMutation = useCreateReply();
  
  const [newReplyContent, setNewReplyContent] = useState('');
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);

  const handleCreateReply = () => {
    if (!newReplyContent.trim()) return;
    
    createReplyMutation.mutate(
      {
        questionId: question.id,
        data: {
          content: newReplyContent,
          course_id: exercise.course_id,
        },
      },
      {
        onSuccess: () => {
          setNewReplyContent('');
          setIsReplyDialogOpen(false);
        },
      }
    );
  };

  const questionUser = question.user || question.profiles;
  const authorName = questionUser ? `${questionUser.first_name} ${questionUser.last_name}` : 'کاربر ناشناس';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Question Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">{authorName}</span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(question.created_at), { addSuffix: true, locale: faIR })}
                </span>
              </div>
              {question.title && (
                <h4 className="font-semibold text-gray-900 mb-2">{question.title}</h4>
              )}
              <div
                className="text-sm text-gray-700"
                dangerouslySetInnerHTML={{ __html: question.content }}
              />
            </div>
          </div>

          {/* Vote and Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onVote('upvote')}
                className={question.user_vote === 'upvote' ? 'bg-green-50' : ''}
              >
                <ChevronUp className="h-4 w-4 mr-1" />
                {question.upvotes}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onVote('downvote')}
                className={question.user_vote === 'downvote' ? 'bg-red-50' : ''}
              >
                <ChevronDown className="h-4 w-4 mr-1" />
                {question.downvotes}
              </Button>
              <Button variant="ghost" size="sm" onClick={onToggleExpand}>
                <ReplyIcon className="h-4 w-4 mr-1" />
                {isExpanded ? replies.length : question.reply_count || 0} پاسخ
                {isExpanded ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsReplyDialogOpen(true)}>
              <ReplyIcon className="h-4 w-4 mr-1" />
              پاسخ
            </Button>
          </div>

          {/* Replies */}
          {isExpanded && (
            <div className="space-y-3 pt-2 pr-4 border-r-2 border-gray-200">
              {repliesLoading ? (
                <div className="text-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-500" />
                </div>
              ) : replies.length === 0 ? (
                <p className="text-sm text-gray-500">هیچ پاسخی وجود ندارد</p>
              ) : (
                replies.map((reply) => {
                  const replyUser = reply.user || reply.profiles;
                  const replyAuthorName = replyUser ? `${replyUser.first_name} ${replyUser.last_name}` : 'کاربر ناشناس';
                  return (
                    <div key={reply.id} className="bg-gray-50 p-3 rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{replyAuthorName}</span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true, locale: faIR })}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: reply.content }} />
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Reply Dialog */}
          <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>پاسخ به سوال</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <RichTextEditor
                  value={newReplyContent}
                  onChange={setNewReplyContent}
                  placeholder="پاسخ خود را بنویسید..."
                  height="120px"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
                    انصراف
                  </Button>
                  <Button
                    onClick={handleCreateReply}
                    disabled={!newReplyContent.trim() || createReplyMutation.isPending}
                  >
                    {createReplyMutation.isPending ? 'در حال ثبت...' : 'ثبت پاسخ'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
