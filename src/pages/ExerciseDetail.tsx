
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Clock, Award, FileText, Send } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

const ExerciseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [solution, setSolution] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Mock exercise data
  const exercise = {
    id: id,
    title: 'React Hooks Basics',
    description: 'Learn the fundamentals of React Hooks including useState, useEffect, and custom hooks.',
    instructions: `
      In this exercise, you will create a simple counter component using React Hooks.

      Requirements:
      1. Create a functional component using useState hook
      2. Implement increment and decrement functionality
      3. Add a reset button to set counter back to 0
      4. Display the current count value
      5. Style the component with basic CSS

      Bonus points:
      - Add input validation to prevent negative numbers
      - Implement a step counter (increment/decrement by custom amount)
    `,
    difficulty: 'Medium',
    estimatedTime: '2 hours',
    dueDate: '2025-06-16',
    points: 100,
    resources: [
      'React Hooks Documentation',
      'useState Hook Guide',
      'useEffect Hook Tutorial'
    ]
  };

  const handleSubmit = () => {
    if (solution.trim()) {
      setSubmitted(true);
      // Here you would typically send the solution to the backend
      console.log('Solution submitted:', solution);
    }
  };

  return (
    <DashboardLayout title="جزئیات تمرین">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            بازگشت
          </Button>
          <div className="flex items-center space-x-2">
            <Badge className="bg-yellow-100 text-yellow-800">{exercise.difficulty}</Badge>
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {exercise.estimatedTime}
            </Badge>
            <Badge variant="outline">
              <Award className="h-3 w-3 mr-1" />
              {exercise.points} امتیاز
            </Badge>
          </div>
        </div>

        {/* Exercise Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{exercise.title}</CardTitle>
            <CardDescription className="text-base">
              موعد تحویل: {exercise.dueDate}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{exercise.description}</p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">دستورالعمل‌ها:</h4>
              <pre className="whitespace-pre-wrap text-sm text-gray-700">
                {exercise.instructions}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              منابع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {exercise.resources.map((resource, index) => (
                <li key={index} className="flex items-center text-teal-600 hover:text-teal-700">
                  <span className="w-2 h-2 bg-teal-500 rounded-full mr-3"></span>
                  <a href="#" className="hover:underline">{resource}</a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Solution Submission */}
        {profile?.role === 'trainee' && (
          <Card>
            <CardHeader>
              <CardTitle>ارسال پاسخ شما</CardTitle>
              <CardDescription>
                کد راه‌حل خود را در زیر بنویسید و برای بررسی ارسال کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!submitted ? (
                <div className="space-y-4">
                  <Textarea
                    placeholder="کد راه‌حل خود را اینجا قرار دهید..."
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    rows={12}
                    className="font-mono"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      مطمئن شوید که کد شما توضیحات مناسب داشته و بهترین روش‌ها را دنبال کند
                    </p>
                    <Button onClick={handleSubmit} disabled={!solution.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      ارسال پاسخ
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">پاسخ ارسال شد!</h3>
                  <p className="text-gray-600">
                    پاسخ شما برای بررسی ارسال شده است. ظرف ۲۴-۴۸ ساعت بازخورد دریافت خواهید کرد.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ExerciseDetail;
