
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { FormQuestion, ExerciseForm } from '@/types/formBuilder';

interface FormBuilderProps {
  value: ExerciseForm;
  onChange: (value: ExerciseForm) => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({ value, onChange }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addQuestion = () => {
    const newQuestion: FormQuestion = {
      id: `question_${Date.now()}`,
      type: 'textbox',
      title: 'سوال جدید',
      required: false,
    };

    const updatedForm: ExerciseForm = {
      questions: [...value.questions, newQuestion]
    };
    
    onChange(updatedForm);
  };

  const updateQuestion = (index: number, updatedQuestion: FormQuestion) => {
    const updatedQuestions = [...value.questions];
    updatedQuestions[index] = updatedQuestion;
    
    const updatedForm: ExerciseForm = {
      questions: updatedQuestions
    };
    
    onChange(updatedForm);
  };

  const deleteQuestion = (index: number) => {
    const updatedQuestions = value.questions.filter((_, i) => i !== index);
    
    const updatedForm: ExerciseForm = {
      questions: updatedQuestions
    };
    
    onChange(updatedForm);
  };

  const moveQuestion = (fromIndex: number, toIndex: number) => {
    const updatedQuestions = [...value.questions];
    const [removed] = updatedQuestions.splice(fromIndex, 1);
    updatedQuestions.splice(toIndex, 0, removed);
    
    const updatedForm: ExerciseForm = {
      questions: updatedQuestions
    };
    
    onChange(updatedForm);
  };

  // Ensure we have a valid questions array
  const questions = Array.isArray(value?.questions) ? value.questions : [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">سوالات تمرین</h3>
        <Button type="button" onClick={addQuestion} size="sm">
          <Plus className="h-4 w-4 ml-2" />
          افزودن سوال
        </Button>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            هنوز سوالی اضافه نشده است. با کلیک روی &quot;افزودن سوال&quot; شروع کنید.
          </CardContent>
        </Card>
      ) : (
        questions.map((question, index) => (
          <QuestionEditor
            key={question.id}
            question={question}
            index={index}
            onUpdate={(updatedQuestion) => updateQuestion(index, updatedQuestion)}
            onDelete={() => deleteQuestion(index)}
            onMove={moveQuestion}
            draggedIndex={draggedIndex}
            setDraggedIndex={setDraggedIndex}
          />
        ))
      )}
    </div>
  );
};

interface QuestionEditorProps {
  question: FormQuestion;
  index: number;
  onUpdate: (question: FormQuestion) => void;
  onDelete: () => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  draggedIndex: number | null;
  setDraggedIndex: (index: number | null) => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  index,
  onUpdate,
  onDelete,
  onMove,
  draggedIndex,
  setDraggedIndex,
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onMove(draggedIndex, index);
    }
    setDraggedIndex(null);
  };

  const updateField = (field: keyof FormQuestion, value: any) => {
    onUpdate({ ...question, [field]: value });
  };

  const needsOptions = question.type === 'dropdown' || question.type === 'checkbox' || question.type === 'radio';

  return (
    <Card 
      className={`transition-all ${draggedIndex === index ? 'opacity-50' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 space-x-reverse">
            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
            <span className="font-medium">سوال {index + 1}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>عنوان سوال</Label>
            <Input
              value={question.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="عنوان سوال را وارد کنید"
            />
          </div>
          
          <div>
            <Label>نوع سوال</Label>
            <Select
              value={question.type}
              onValueChange={(value) => updateField('type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="input">فیلد ورودی</SelectItem>
                <SelectItem value="textbox">متن چندخطی</SelectItem>
                <SelectItem value="dropdown">لیست کشویی</SelectItem>
                <SelectItem value="radio">انتخاب تکی</SelectItem>
                <SelectItem value="checkbox">انتخاب چندگانه</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>توضیحات (اختیاری)</Label>
          <RichTextEditor
            value={question.description || ''}
            onChange={(value) => updateField('description', value)}
            placeholder="توضیحات اضافی برای سوال"
            height="80px"
          />
        </div>

        {(question.type === 'input' || question.type === 'textbox') && (
          <div>
            <Label>متن راهنما (placeholder)</Label>
            <Input
              value={question.placeholder || ''}
              onChange={(e) => updateField('placeholder', e.target.value)}
              placeholder="متن راهنما برای کاربر"
            />
          </div>
        )}

        {needsOptions && (
          <div>
            <Label>گزینه‌ها</Label>
            <OptionsList
              options={question.options || []}
              onChange={(options) => updateField('options', options)}
            />
          </div>
        )}

        <div className="flex items-center space-x-2 space-x-reverse">
          <Checkbox
            id={`required-${question.id}`}
            checked={question.required}
            onCheckedChange={(checked) => updateField('required', checked)}
          />
          <Label htmlFor={`required-${question.id}`}>
            این سوال اجباری است
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};

interface OptionsListProps {
  options: string[];
  onChange: (options: string[]) => void;
}

const OptionsList: React.FC<OptionsListProps> = ({ options, onChange }) => {
  const addOption = () => {
    onChange([...options, `گزینه ${options.length + 1}`]);
  };

  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    onChange(updatedOptions);
  };

  const deleteOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    onChange(updatedOptions);
  };

  return (
    <div className="space-y-2">
      {options.map((option, index) => (
        <div key={index} className="flex items-center space-x-2 space-x-reverse">
          <Input
            value={option}
            onChange={(e) => updateOption(index, e.target.value)}
            placeholder={`گزینه ${index + 1}`}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => deleteOption(index)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addOption}
        className="w-full"
      >
        <Plus className="h-4 w-4 ml-2" />
        افزودن گزینه
      </Button>
    </div>
  );
};
