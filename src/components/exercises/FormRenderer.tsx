
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ExerciseForm, FormAnswer } from '@/types/formBuilder';

interface FormRendererProps {
  form: ExerciseForm;
  answers: FormAnswer[];
  onChange: (answers: FormAnswer[]) => void;
  disabled?: boolean;
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  form,
  answers,
  onChange,
  disabled = false
}) => {
  const updateAnswer = (questionId: string, answer: string | string[]) => {
    const existingAnswerIndex = answers.findIndex(a => a.questionId === questionId);
    const newAnswers = [...answers];

    if (existingAnswerIndex >= 0) {
      newAnswers[existingAnswerIndex] = { questionId, answer };
    } else {
      newAnswers.push({ questionId, answer });
    }

    onChange(newAnswers);
  };

  const getAnswer = (questionId: string): string | string[] => {
    const answer = answers.find(a => a.questionId === questionId);
    return answer?.answer || '';
  };

  const renderQuestion = (question: any, index: number) => {
    const answer = getAnswer(question.id);

    return (
      <Card key={question.id} className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <span className="ml-2">{index + 1}.</span>
            {question.title}
            {question.required && <span className="text-red-500 mr-1">*</span>}
          </CardTitle>
          {question.description && (
            <p className="text-sm text-gray-600">{question.description}</p>
          )}
        </CardHeader>
        
        <CardContent>
          {question.type === 'input' && (
            <Input
              value={answer as string}
              onChange={(e) => updateAnswer(question.id, e.target.value)}
              placeholder={question.placeholder}
              disabled={disabled}
            />
          )}

          {question.type === 'textbox' && (
            <Textarea
              value={answer as string}
              onChange={(e) => updateAnswer(question.id, e.target.value)}
              placeholder={question.placeholder}
              rows={4}
              disabled={disabled}
            />
          )}

          {question.type === 'dropdown' && (
            <Select
              value={answer as string}
              onValueChange={(value) => updateAnswer(question.id, value)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="یک گزینه انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map((option: string, optionIndex: number) => (
                  <SelectItem key={optionIndex} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {question.type === 'radio' && (
            <RadioGroup
              value={answer as string}
              onValueChange={(value) => updateAnswer(question.id, value)}
              disabled={disabled}
            >
              {question.options?.map((option: string, optionIndex: number) => (
                <div key={optionIndex} className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value={option} id={`${question.id}-${optionIndex}`} />
                  <Label htmlFor={`${question.id}-${optionIndex}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {question.type === 'checkbox' && (
            <div className="space-y-2">
              {question.options?.map((option: string, optionIndex: number) => {
                const selectedOptions = Array.isArray(answer) ? answer : [];
                const isChecked = selectedOptions.includes(option);

                return (
                  <div key={optionIndex} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`${question.id}-${optionIndex}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        let newSelectedOptions;
                        if (checked) {
                          newSelectedOptions = [...selectedOptions, option];
                        } else {
                          newSelectedOptions = selectedOptions.filter(o => o !== option);
                        }
                        updateAnswer(question.id, newSelectedOptions);
                      }}
                      disabled={disabled}
                    />
                    <Label htmlFor={`${question.id}-${optionIndex}`}>{option}</Label>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {form.questions.map((question, index) => renderQuestion(question, index))}
    </div>
  );
};
