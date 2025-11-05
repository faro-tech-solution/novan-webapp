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
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  ClipboardList,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import {
  useQuizQuestionsQuery,
} from '@/hooks/queries/useQuizQuestionsQuery';
import { useCoursesQuery } from '@/hooks/queries/useCoursesQuery';
import { useExerciseCategoriesQuery } from '@/hooks/queries/useExerciseCategoriesQuery';
import { useAuth } from '@/contexts/AuthContext';
import { QuizQuestion } from '@/types/quiz';
import { CreateQuizQuestionForm } from './CreateQuizQuestionForm';
import { useToast } from '@/hooks/use-toast';

const QuizQuestionManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<QuizQuestion | null>(null);
  
  const { courses } = useCoursesQuery();
  const { categories } = useExerciseCategoriesQuery(selectedCourseId);
  const { 
    questions, 
    loading, 
    createQuestion, 
    updateQuestion, 
    deleteQuestion 
  } = useQuizQuestionsQuery(selectedCourseId || '', !!selectedCourseId);

  // Filter questions by category and search
  const filteredQuestions = questions.filter(q => {
    const matchesCategory = selectedCategoryId === 'all' || q.category_id === selectedCategoryId;
    const matchesSearch = searchQuery === '' || 
      q.question_text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreate = async (questionData: any) => {
    try {
      if (!user?.id) {
        toast({
          title: 'خطا',
          description: 'کاربر وارد نشده است',
          variant: 'destructive',
        });
        return;
      }
      await createQuestion({
        ...questionData,
        created_by: user.id,
        course_id: selectedCourseId,
      });
      setIsCreateDialogOpen(false);
      toast({
        title: 'موفقیت',
        description: 'سوال با موفقیت ایجاد شد',
      });
    } catch (error: any) {
      toast({
        title: 'خطا',
        description: error.message || 'خطا در ایجاد سوال',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = async (questionId: string, questionData: any) => {
    try {
      await updateQuestion({ questionId, questionData });
      setEditingQuestion(null);
      toast({
        title: 'موفقیت',
        description: 'سوال با موفقیت به‌روزرسانی شد',
      });
    } catch (error: any) {
      toast({
        title: 'خطا',
        description: error.message || 'خطا در به‌روزرسانی سوال',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (questionId: string) => {
    try {
      await deleteQuestion(questionId);
      setQuestionToDelete(null);
      toast({
        title: 'موفقیت',
        description: 'سوال با موفقیت حذف شد',
      });
    } catch (error: any) {
      toast({
        title: 'خطا',
        description: error.message || 'خطا در حذف سوال',
        variant: 'destructive',
      });
    }
  };

  const getAnswerLabel = (answer: 'a' | 'b' | 'c' | 'd') => {
    const labels = { a: 'الف', b: 'ب', c: 'ج', d: 'د' };
    return labels[answer];
  };

  return (
    <DashboardLayout title="مدیریت بانک سوالات آزمون">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 font-yekanbakh">
            مدیریت بانک سوالات آزمون
          </h2>
          {selectedCourseId && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 ml-2" />
              افزودن سوال جدید
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">کل سوالات</p>
                  <p className="text-2xl font-bold">{filteredQuestions.length}</p>
                </div>
                <ClipboardList className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>انتخاب دوره</Label>
                <Select value={selectedCourseId || undefined} onValueChange={setSelectedCourseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب دوره" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses?.filter(course => course.id && course.name).map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCourseId && (
                <div>
                  <Label>فصل</Label>
                  <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب فصل" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه فصول</SelectItem>
                      {categories?.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>جستجو</Label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="جستجو در سوالات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Table */}
        <Card>
          <CardHeader>
            <CardTitle>لیست سوالات</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedCourseId ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">لطفاً ابتدا یک دوره را انتخاب کنید</p>
              </div>
            ) : loading ? (
              <div className="text-center py-12">در حال بارگذاری...</div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">هیچ سوالی یافت نشد</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 ml-2" />
                  افزودن اولین سوال
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>سوال</TableHead>
                    <TableHead>فصل</TableHead>
                    <TableHead>تمرین</TableHead>
                    <TableHead>پاسخ صحیح</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell className="max-w-md">
                        <div className="text-sm font-medium">
                          {question.question_text}
                        </div>
                      </TableCell>
                      <TableCell>
                        {question.category_name ? (
                          <Badge variant="outline">{question.category_name}</Badge>
                        ) : (
                          <span className="text-xs text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {question.exercise_name ? (
                          <Badge variant="outline">{question.exercise_name}</Badge>
                        ) : (
                          <span className="text-xs text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {getAnswerLabel(question.correct_answer)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingQuestion(question)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setQuestionToDelete(question)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
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
      </div>

      {/* Create/Edit Dialog */}
      {(isCreateDialogOpen || editingQuestion) && (
        <CreateQuizQuestionForm
          courseId={selectedCourseId}
          initialData={editingQuestion}
          onSubmit={editingQuestion 
            ? (data) => handleEdit(editingQuestion.id, data)
            : handleCreate
          }
          onCancel={() => {
            setIsCreateDialogOpen(false);
            setEditingQuestion(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {questionToDelete && (
        <Dialog open={!!questionToDelete} onOpenChange={() => setQuestionToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>حذف سوال</DialogTitle>
            </DialogHeader>
            <p className="text-gray-600">
              آیا از حذف این سوال اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setQuestionToDelete(null)}>
                انصراف
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleDelete(questionToDelete.id)}
              >
                حذف
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default QuizQuestionManagement;
