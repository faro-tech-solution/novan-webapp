'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
  MessageSquare,
  Search,
  MoreHorizontal,
  Flag,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Reply,
  FileText,
  User,
  Calendar,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { faIR } from 'date-fns/locale';
import {
  useAdminQuestions,
  useQAManagementStats,
  useModerateQuestion,
  useBulkModerateQuestions,
  useQuestionReplies,
  useCreateReply,
  useVoteQuestion,
} from '@/hooks/queries/useExerciseQA';
import { QAManagementFilters, AdminQuestion } from '@/types/exerciseQA';
import { useCoursesQuery } from '@/hooks/queries/useCoursesQuery';

const QAManagement = () => {
  const [filters, setFilters] = useState<QAManagementFilters>({
    status: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<AdminQuestion | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isModerationDialogOpen, setIsModerationDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const { data: questions = [], isLoading } = useAdminQuestions(filters);
  const { data: stats } = useQAManagementStats();
  const { courses } = useCoursesQuery();
  const moderateQuestion = useModerateQuestion();
  const voteQuestion = useVoteQuestion();
  const bulkModerate = useBulkModerateQuestions();

  const handleFilterChange = (key: keyof QAManagementFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleQuestionSelect = (questionId: string, checked: boolean) => {
    if (checked) {
      setSelectedQuestions(prev => [...prev, questionId]);
    } else {
      setSelectedQuestions(prev => prev.filter(id => id !== questionId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedQuestions(questions.map(q => q.id));
    } else {
      setSelectedQuestions([]);
    }
  };

  const handleModerateQuestion = async (questionId: string, action: string) => {
    await moderateQuestion.mutateAsync({
      questionId,
      action: action as any,
      adminNotes: adminNotes || undefined,
    });
    setIsModerationDialogOpen(false);
    setAdminNotes('');
  };

  const handleBulkAction = async (action: string) => {
    if (selectedQuestions.length === 0) return;
    
    await bulkModerate.mutateAsync({
      questionIds: selectedQuestions,
      action: action as any,
    });
    setSelectedQuestions([]);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">تایید شده</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">رد شده</Badge>;
      case 'flagged':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">پرچم‌دار</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">در انتظار</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">نامشخص</Badge>;
    }
  };

  const getQuestionAuthor = (question: AdminQuestion) => {
    const user = question.user || question.profiles;
    return user ? `${user.first_name} ${user.last_name}` : 'کاربر ناشناس';
  };

  return (
    <DashboardLayout title="مدیریت پرسش و پاسخ">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-yekanbakh">
            مدیریت پرسش و پاسخ
          </h2>
          <p className="text-gray-600">مدیریت و نظارت بر سوالات و پاسخ‌های دانشجویان</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">کل سوالات</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalQuestions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">در انتظار بررسی</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.pendingQuestions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">حل شده</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.resolvedQuestions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">پرچم‌دار</CardTitle>
                <Flag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.flaggedQuestions}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <CardTitle>فیلترها و عملیات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">جستجو</Label>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="جستجو در سوالات..."
                    value={filters.searchQuery || ''}
                    onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">وضعیت</Label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="وضعیت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه</SelectItem>
                    <SelectItem value="pending">در انتظار</SelectItem>
                    <SelectItem value="approved">تایید شده</SelectItem>
                    <SelectItem value="rejected">رد شده</SelectItem>
                    <SelectItem value="flagged">پرچم‌دار</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">دوره</Label>
                <Select
                  value={filters.courseId || 'all'}
                  onValueChange={(value) => handleFilterChange('courseId', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="دوره" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه دوره‌ها</SelectItem>
                    {courses?.map((course: any) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">مرتب‌سازی</Label>
                <Select
                  value={filters.sortBy || 'created_at'}
                  onValueChange={(value) => handleFilterChange('sortBy', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="مرتب‌سازی" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">تاریخ</SelectItem>
                    <SelectItem value="upvotes">رای مثبت</SelectItem>
                    <SelectItem value="downvotes">رای منفی</SelectItem>
                    <SelectItem value="reply_count">تعداد پاسخ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedQuestions.length > 0 && (
              <div className="flex items-center gap-2 pt-4 border-t">
                <span className="text-sm text-gray-600">
                  {selectedQuestions.length} سوال انتخاب شده
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('approve')}
                  disabled={bulkModerate.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  تایید همه
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('reject')}
                  disabled={bulkModerate.isPending}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  رد همه
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  disabled={bulkModerate.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  حذف همه
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Questions Table */}
        <Card>
          <CardHeader>
            <CardTitle>لیست سوالات</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-lg text-gray-600">در حال بارگذاری...</div>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">هیچ سوالی یافت نشد</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedQuestions.length === questions.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>سوال</TableHead>
                    <TableHead>نویسنده</TableHead>
                    <TableHead>تمرین</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>رای‌ها</TableHead>
                    <TableHead>تاریخ</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedQuestions.includes(question.id)}
                          onCheckedChange={(checked) => 
                            handleQuestionSelect(question.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium truncate">
                            {question.title || 'بدون عنوان'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getQuestionAuthor(question)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {question.exercise?.title || 'نامشخص'}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(question.moderation_status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => voteQuestion.mutate({ questionId: question.id, voteType: 'upvote' })}
                            disabled={voteQuestion.isPending}
                            className={`h-6 w-6 p-0 ${question.user_vote === 'upvote' ? 'bg-green-100 text-green-600' : 'hover:bg-green-50'}`}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <span className="text-xs text-gray-600">{question.upvotes}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => voteQuestion.mutate({ questionId: question.id, voteType: 'downvote' })}
                            disabled={voteQuestion.isPending}
                            className={`h-6 w-6 p-0 ${question.user_vote === 'downvote' ? 'bg-red-100 text-red-600' : 'hover:bg-red-50'}`}
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                          <span className="text-xs text-gray-600">{question.downvotes}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {formatDistanceToNow(new Date(question.created_at), { 
                            addSuffix: true, 
                            locale: faIR 
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedQuestion(question);
                              setIsDetailDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedQuestion(question);
                              setAdminNotes(question.admin_notes || '');
                              setIsModerationDialogOpen(true);
                            }}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Question Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>جزئیات سوال</DialogTitle>
            </DialogHeader>
            {selectedQuestion && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <Label>عنوان</Label>
                      </div>
                      <p className="text-sm font-medium">{selectedQuestion.title || 'بدون عنوان'}</p>
                    </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-green-600" />
                      <Label>نویسنده</Label>
                    </div>
                    <p className="text-sm">{getQuestionAuthor(selectedQuestion)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <Label>تاریخ</Label>
                    </div>
                    <p className="text-sm">
                      {formatDistanceToNow(new Date(selectedQuestion.created_at), { 
                        addSuffix: true, 
                        locale: faIR 
                      })}
                    </p>
                  </div>
                </div>
                
                
                <div>
                  <div 
                    className="text-sm border rounded p-3 bg-gray-100"
                    dangerouslySetInnerHTML={{ __html: selectedQuestion.content }}
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => voteQuestion.mutate({ questionId: selectedQuestion.id, voteType: 'upvote' })}
                      disabled={voteQuestion.isPending}
                      className={`h-8 w-8 p-0 ${selectedQuestion.user_vote === 'upvote' ? 'bg-green-100 text-green-600' : 'hover:bg-green-50'}`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Badge variant="outline">{selectedQuestion.upvotes}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => voteQuestion.mutate({ questionId: selectedQuestion.id, voteType: 'downvote' })}
                      disabled={voteQuestion.isPending}
                      className={`h-8 w-8 p-0 ${selectedQuestion.user_vote === 'downvote' ? 'bg-red-100 text-red-600' : 'hover:bg-red-50'}`}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                    <Badge variant="outline">{selectedQuestion.downvotes}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Reply className="h-4 w-4 text-blue-600" />
                    <Badge variant="outline">{selectedQuestion.reply_count || 0}</Badge>
                  </div>
                  
                  {/* Moderation Actions */}
                  <div className="flex items-center gap-2 ml-4 pl-4 border-l">
                    <Button
                      variant={selectedQuestion.moderation_status === 'approved' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => moderateQuestion.mutateAsync({ 
                        questionId: selectedQuestion.id, 
                        action: 'approve',
                        adminNotes: ''
                      })}
                      disabled={moderateQuestion.isPending}
                      className={`h-8 px-3 ${
                        selectedQuestion.moderation_status === 'approved' 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'text-green-600 border-green-200 hover:bg-green-50'
                      }`}
                    >
                      تایید
                    </Button>
                    <Button
                      variant={selectedQuestion.moderation_status === 'rejected' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => moderateQuestion.mutateAsync({ 
                        questionId: selectedQuestion.id, 
                        action: 'reject',
                        adminNotes: ''
                      })}
                      disabled={moderateQuestion.isPending}
                      className={`h-8 px-3 ${
                        selectedQuestion.moderation_status === 'rejected' 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'text-red-600 border-red-200 hover:bg-red-50'
                      }`}
                    >
                      رد
                    </Button>
                    <Button
                      variant={selectedQuestion.moderation_status === 'flagged' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => moderateQuestion.mutateAsync({ 
                        questionId: selectedQuestion.id, 
                        action: 'flag',
                        adminNotes: ''
                      })}
                      disabled={moderateQuestion.isPending}
                      className={`h-8 px-3 ${
                        selectedQuestion.moderation_status === 'flagged' 
                          ? 'bg-orange-600 text-white hover:bg-orange-700' 
                          : 'text-orange-600 border-orange-200 hover:bg-orange-50'
                      }`}
                    >
                      پرچم دار
                    </Button>
                  </div>
                </div>

                {/* Replies Section */}
                <QuestionRepliesList 
                  questionId={selectedQuestion.id} 
                  courseId={selectedQuestion.course_id} 
                />
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Moderation Dialog */}
        <Dialog open={isModerationDialogOpen} onOpenChange={setIsModerationDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>مدیریت سوال</DialogTitle>
            </DialogHeader>
            {selectedQuestion && (
              <div className="space-y-4">
                <div>
                  <Label>یادداشت مدیریتی</Label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="یادداشت خود را وارد کنید..."
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsModerationDialogOpen(false);
                      setAdminNotes('');
                    }}
                  >
                    انصراف
                  </Button>
                  <Button
                    onClick={() => handleModerateQuestion(selectedQuestion.id, 'approve')}
                    disabled={moderateQuestion.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    تایید
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleModerateQuestion(selectedQuestion.id, 'reject')}
                    disabled={moderateQuestion.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    رد
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleModerateQuestion(selectedQuestion.id, 'flag')}
                    disabled={moderateQuestion.isPending}
                  >
                    <Flag className="h-4 w-4 mr-1" />
                    پرچم‌دار
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

// Component to display replies for a question
const QuestionRepliesList: React.FC<{ questionId: string; courseId: string }> = ({ questionId, courseId }) => {
  const { data: replies = [], isLoading } = useQuestionReplies(questionId, true);
  const createReplyMutation = useCreateReply();
  const voteQuestion = useVoteQuestion();
  const moderateQuestion = useModerateQuestion();
  const [newReplyContent, setNewReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getReplyAuthor = (reply: any) => {
    const user = reply.user || reply.profiles;
    return user ? `${user.first_name} ${user.last_name}` : 'کاربر ناشناس';
  };

  const handleCreateReply = async () => {
    if (!newReplyContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      await createReplyMutation.mutateAsync({
        questionId,
        data: {
          content: newReplyContent,
          course_id: courseId,
        },
      });
      setNewReplyContent('');
    } catch (error) {
      console.error('Error creating reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-6">
        <h4 className="text-lg font-semibold mb-4">پاسخ‌ها</h4>
        <div className="flex items-center justify-center py-4">
          <div className="text-sm text-gray-500">در حال بارگذاری...</div>
        </div>
      </div>
    );
  }

  if (replies.length === 0) {
    return (
      <div className="mt-6">
        <h4 className="text-lg font-semibold mb-4">پاسخ‌ها</h4>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Reply className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">هیچ پاسخی وجود ندارد</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold mb-4">پاسخ‌ها ({replies.length})</h4>
      
      {/* Reply Area */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <h5 className="text-sm font-medium mb-3">پاسخ جدید</h5>
        <div className="space-y-3">
          <RichTextEditor
            value={newReplyContent}
            onChange={setNewReplyContent}
            placeholder="پاسخ خود را بنویسید..."
            height="120px"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewReplyContent('')}
              disabled={isSubmitting}
            >
              پاک کردن
            </Button>
            <Button
              size="sm"
              onClick={handleCreateReply}
              disabled={!newReplyContent.trim() || isSubmitting}
            >
              {isSubmitting ? 'در حال ارسال...' : 'ارسال پاسخ'}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {replies.map((reply: any) => (
          <div key={reply.id} className="border rounded-lg p-4 bg-white">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {getReplyAuthor(reply).charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{getReplyAuthor(reply)}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(reply.created_at), { 
                      addSuffix: true, 
                      locale: faIR 
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => voteQuestion.mutate({ questionId: reply.id, voteType: 'upvote' })}
                    disabled={voteQuestion.isPending}
                    className={`h-6 w-6 p-0 ${reply.user_vote === 'upvote' ? 'bg-green-100 text-green-600' : 'hover:bg-green-50'}`}
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </Button>
                  <span className="text-xs text-gray-600">{reply.upvotes || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => voteQuestion.mutate({ questionId: reply.id, voteType: 'downvote' })}
                    disabled={voteQuestion.isPending}
                    className={`h-6 w-6 p-0 ${reply.user_vote === 'downvote' ? 'bg-red-100 text-red-600' : 'hover:bg-red-50'}`}
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </Button>
                  <span className="text-xs text-gray-600">{reply.downvotes || 0}</span>
                </div>
                
                {/* Moderation Actions for Replies */}
                <div className="flex items-center gap-1 ml-2 pl-2 border-l">
                  <Button
                    variant={reply.moderation_status === 'approved' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => moderateQuestion.mutateAsync({ 
                      questionId: reply.id, 
                      action: 'approve',
                      adminNotes: ''
                    })}
                    disabled={moderateQuestion.isPending}
                    className={`h-6 px-2 text-xs ${
                      reply.moderation_status === 'approved' 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'text-green-600 border-green-200 hover:bg-green-50'
                    }`}
                  >
                    تایید
                  </Button>
                  <Button
                    variant={reply.moderation_status === 'rejected' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => moderateQuestion.mutateAsync({ 
                      questionId: reply.id, 
                      action: 'reject',
                      adminNotes: ''
                    })}
                    disabled={moderateQuestion.isPending}
                    className={`h-6 px-2 text-xs ${
                      reply.moderation_status === 'rejected' 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'text-red-600 border-red-200 hover:bg-red-50'
                    }`}
                  >
                    رد
                  </Button>
                  <Button
                    variant={reply.moderation_status === 'flagged' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => moderateQuestion.mutateAsync({ 
                      questionId: reply.id, 
                      action: 'flag',
                      adminNotes: ''
                    })}
                    disabled={moderateQuestion.isPending}
                    className={`h-6 px-2 text-xs ${
                      reply.moderation_status === 'flagged' 
                        ? 'bg-orange-600 text-white hover:bg-orange-700' 
                        : 'text-orange-600 border-orange-200 hover:bg-orange-50'
                    }`}
                  >
                    پرچم
                  </Button>
                </div>
              </div>
            </div>
            <div 
              className="text-sm text-gray-700 leading-relaxed bg-gray-100 p-3 rounded"
              dangerouslySetInnerHTML={{ __html: reply.content }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default QAManagement;
