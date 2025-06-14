
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, FileText, Award, TrendingUp, Play } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useUser } from '@/contexts/UserContext';

const TraineeDashboard = () => {
  const { user } = useUser();
  
  // Mock data
  const stats = {
    completedExercises: 12,
    pendingExercises: 3,
    averageScore: 88,
    totalPoints: 1250
  };

  const assignedExercises = [
    { 
      id: 1, 
      title: 'React Hooks Basics', 
      dueDate: '2025-06-16', 
      status: 'pending', 
      difficulty: 'Medium',
      estimatedTime: '2 hours'
    },
    { 
      id: 2, 
      title: 'CSS Grid Layout', 
      dueDate: '2025-06-18', 
      status: 'pending', 
      difficulty: 'Easy',
      estimatedTime: '1 hour'
    },
    { 
      id: 3, 
      title: 'JavaScript Promises', 
      dueDate: '2025-06-20', 
      status: 'not_started', 
      difficulty: 'Hard',
      estimatedTime: '3 hours'
    },
  ];

  const recentScores = [
    { exercise: 'HTML Forms', score: 95, date: '2025-06-10' },
    { exercise: 'CSS Animations', score: 82, date: '2025-06-08' },
    { exercise: 'DOM Manipulation', score: 90, date: '2025-06-05' },
  ];

  const dailyTasks = [
    { id: 1, task: 'Complete React Hooks exercise', completed: false },
    { id: 2, task: 'Review CSS Grid concepts', completed: true },
    { id: 3, task: 'Practice JavaScript functions', completed: true },
    { id: 4, task: 'Submit HTML Forms assignment', completed: false },
  ];

  const completedTasks = dailyTasks.filter(task => task.completed).length;
  const progressPercentage = (completedTasks / dailyTasks.length) * 100;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h2>
          <p className="opacity-90">Class: {user?.className}</p>
          <p className="opacity-90">You have {stats.pendingExercises} exercises to complete</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedExercises}</div>
              <p className="text-xs text-muted-foreground">exercises finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingExercises}</div>
              <p className="text-xs text-muted-foreground">exercises due</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}%</div>
              <p className="text-xs text-muted-foreground">across all exercises</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPoints}</div>
              <p className="text-xs text-muted-foreground">points earned</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assigned Exercises */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned Exercises</CardTitle>
              <CardDescription>Your current assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignedExercises.map((exercise) => (
                  <div key={exercise.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(exercise.status)}
                        <h4 className="font-medium">{exercise.title}</h4>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Due: {exercise.dueDate}</span>
                        <span>{exercise.estimatedTime}</span>
                      </div>
                      <Badge className={`mt-2 ${getDifficultyColor(exercise.difficulty)}`}>
                        {exercise.difficulty}
                      </Badge>
                    </div>
                    <Button size="sm" className="ml-4">
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Progress</CardTitle>
              <CardDescription>Today's tasks and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Daily Tasks</span>
                    <span>{completedTasks}/{dailyTasks.length} completed</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                <div className="space-y-2">
                  {dailyTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                      }`}>
                        {task.completed && <CheckCircle className="h-3 w-3 text-white" />}
                      </div>
                      <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : ''}`}>
                        {task.task}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Scores</CardTitle>
            <CardDescription>Your latest exercise performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentScores.map((score, index) => (
                <div key={index} className="p-4 border rounded-lg text-center">
                  <h4 className="font-medium mb-2">{score.exercise}</h4>
                  <div className="text-2xl font-bold text-teal-600 mb-1">{score.score}%</div>
                  <p className="text-sm text-gray-600">{score.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TraineeDashboard;
