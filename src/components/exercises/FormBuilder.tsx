
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { FormQuestion, ExerciseForm } from '@/types/formBuilder';

interface FormBuilderProps {
  value: ExerciseForm;
  onChange: (form: ExerciseForm) => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({ value, onChange }) => {
  const [draggedQuestion, setDraggedQuestion] = useState<string | null>(null);

  const addQuestion = () => {
    const newQuestion: FormQuestion = {
      id: `q_${Date.now()}`,
      type: 'input',
      title: 'سوال جدید',
      required: false,
    };

    onChange({
      ...value,
      questions: [...value.questions, newQuestion],
    });
  };

  const updateQuestion = (questionId: string, updates: Partial<FormQuestion>) => {
    const updatedQuestions = value.questions.map(q =>
      q.id === questionId ? { ...q, ...updates } : q
    );

    onChange({
      ...value,
      questions: updatedQuestions,
    });
  };

  const deleteQuestion = (questionId: string) => {
    const filteredQuestions = value.questions.filter(q => q.id !== questionId);
    onChange({
      ...value,
      questions: filteredQuestions,
    });
  };

  const addOption = (questionId: string) => {
    const question = value.questions.find(q => q.id === questionId);
    if (question) {
      const newOptions = [...(question.options || []), 'گزینه جدید'];
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = value.questions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const deleteOption = (questionId: string, optionIndex: number) => {
    const question = value.questions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = question.options.filter((_, index) => index !== optionIndex);
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const needsOptions = (type: string) => {
    return ['dropdown', 'checkbox', 'radio'].includes(type);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">ساخت فرم تمرین</h3>
        <Button onClick={addQuestion} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          افزودن سوال
        </Button>
      </div>

      {value.questions.map((question, index) => (
        <Card key={question.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                <span className="text-sm text-gray-500">سوال {index + 1}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteQuestion(question.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Question Title */}
            <div>
              <Label htmlFor={`title-${question.id}`}>عنوان سوال</Label>
              <Input
                id={`title-${question.id}`}
                value={question.title}
                onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
                placeholder="عنوان سوال را وارد کنید"
              />
            </div>

            {/* Question Description */}
            <div>
              <Label htmlFor={`desc-${question.id}`}>توضیحات (اختیاری)</Label>
              <Textarea
                id={`desc-${question.id}`}
                value={question.description || ''}
                onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
                placeholder="توضیحات سوال"
                rows={2}
              />
            </div>

            {/* Question Type */}
            <div>
              <Label>نوع سوال</Label>
              <Select
                value={question.type}
                onValueChange={(value: any) => updateQuestion(question.id, { type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="input">فیلد ورودی</SelectItem>
                  <SelectItem value="textbox">جعبه متن</SelectItem>
                  <SelectItem value="dropdown">منوی کشویی</SelectItem>
                  <SelectItem value="radio">گزینه‌های تکی</SelectItem>
                  <SelectItem value="checkbox">چندین انتخاب</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Placeholder for input/textbox */}
            {(question.type === 'input' || question.type === 'textbox') && (
              <div>
                <Label htmlFor={`placeholder-${question.id}`}>متن راهنما</Label>
                <Input
                  id={`placeholder-${question.id}`}
                  value={question.placeholder || ''}
                  onChange={(e) => updateQuestion(question.id, { placeholder: e.target.value })}
                  placeholder="متن راهنما برای کاربر"
                />
              </div>
            )}

            {/* Options for dropdown/radio/checkbox */}
            {needsOptions(question.type) && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>گزینه‌ها</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addOption(question.id)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    افزودن گزینه
                  </Button>
                </div>
                
                {question.options?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2 space-x-reverse mb-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                      placeholder={`گزینه ${optionIndex + 1}`}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteOption(question.id, optionIndex)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Required Toggle */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                id={`required-${question.id}`}
                checked={question.required}
                onCheckedChange={(checked) => updateQuestion(question.id, { required: checked })}
              />
              <Label htmlFor={`required-${question.id}`}>
                {question.required ? 'اجباری' : 'اختیاری'}
              </Label>
            </div>
          </CardContent>
        </Card>
      ))}

      {value.questions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>هیچ سوالی اضافه نشده است</p>
          <p className="text-sm">برای شروع، یک سوال اضافه کنید</p>
        </div>
      )}
    </div>
  );
};
