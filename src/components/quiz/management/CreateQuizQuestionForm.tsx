'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useExerciseCategoriesQuery } from '@/hooks/queries/useExerciseCategoriesQuery';
import { fetchExercises } from '@/services/exerciseFetchService';
import { QuizQuestion } from '@/types/quiz';

interface CreateQuizQuestionFormProps {
  courseId: string;
  initialData?: QuizQuestion | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const CreateQuizQuestionForm: React.FC<CreateQuizQuestionFormProps> = ({
  courseId,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<{
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: 'a' | 'b' | 'c' | 'd' | '';
    category_id: string | undefined;
    exercise_id: string | undefined;
  }>({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: '',
    category_id: undefined,
    exercise_id: undefined,
  });
  const [exercises, setExercises] = useState<any[]>([]);

  const { categories } = useExerciseCategoriesQuery(courseId);

  useEffect(() => {
    if (initialData) {
      setFormData({
        question_text: initialData.question_text,
        option_a: initialData.option_a,
        option_b: initialData.option_b,
        option_c: initialData.option_c,
        option_d: initialData.option_d,
        correct_answer: initialData.correct_answer,
        category_id: initialData.category_id || undefined,
        exercise_id: initialData.exercise_id || undefined,
      });
    }
  }, [initialData]);

  useEffect(() => {
    const loadExercises = async () => {
      try {
        const data = await fetchExercises(courseId);
        setExercises(data);
      } catch (error) {
        console.error('Error loading exercises:', error);
      }
    };
    loadExercises();
  }, [courseId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.correct_answer) {
      alert('لطفاً پاسخ صحیح را انتخاب کنید');
      return;
    }
    onSubmit({
      ...formData,
      category_id: formData.category_id || null,
      exercise_id: formData.exercise_id || null,
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'ویرایش سوال' : 'افزودن سوال جدید'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>متن سوال *</Label>
            <Textarea
              value={formData.question_text}
              onChange={(e) => handleChange('question_text', e.target.value)}
              placeholder="متن سوال را وارد کنید..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>آیتم الف *</Label>
              <Input
                value={formData.option_a}
                onChange={(e) => handleChange('option_a', e.target.value)}
                placeholder="گزینه الف"
                required
              />
            </div>
            <div>
              <Label>آیتم ب *</Label>
              <Input
                value={formData.option_b}
                onChange={(e) => handleChange('option_b', e.target.value)}
                placeholder="گزینه ب"
                required
              />
            </div>
            <div>
              <Label>آیتم ج *</Label>
              <Input
                value={formData.option_c}
                onChange={(e) => handleChange('option_c', e.target.value)}
                placeholder="گزینه ج"
                required
              />
            </div>
            <div>
              <Label>آیتم د *</Label>
              <Input
                value={formData.option_d}
                onChange={(e) => handleChange('option_d', e.target.value)}
                placeholder="گزینه د"
                required
              />
            </div>
          </div>

          <div>
            <Label>پاسخ صحیح *</Label>
            <Select 
              value={formData.correct_answer || undefined} 
              onValueChange={(value: any) => handleChange('correct_answer', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="انتخاب پاسخ صحیح" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">الف) {formData.option_a || '...'}</SelectItem>
                <SelectItem value="b">ب) {formData.option_b || '...'}</SelectItem>
                <SelectItem value="c">ج) {formData.option_c || '...'}</SelectItem>
                <SelectItem value="d">د) {formData.option_d || '...'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>فصل (اختیاری)</Label>
              <Select 
                value={formData.category_id || undefined} 
                onValueChange={(value) => handleChange('category_id', value === 'none' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب فصل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون فصل</SelectItem>
                  {categories?.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>تمرین (اختیاری)</Label>
              <Select 
                value={formData.exercise_id || undefined} 
                onValueChange={(value) => handleChange('exercise_id', value === 'none' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب تمرین" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون تمرین خاص</SelectItem>
                  {exercises.map(ex => (
                    <SelectItem key={ex.id} value={ex.id}>
                      {ex.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              انصراف
            </Button>
            <Button type="submit">
              {initialData ? 'ذخیره تغییرات' : 'افزودن سوال'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
