import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import TrainerDashboard from "@/pages/TrainerDashboard";
import TraineeDashboard from "@/pages/TraineeDashboard";
import Courses from "@/pages/Courses";
import StudentCourses from "@/pages/StudentCourses";
import Instructors from "@/pages/Instructors";
import Exercises from "@/pages/Exercises";
import MyExercises from "@/pages/MyExercises";
import ExerciseDetail from "@/pages/ExerciseDetail";
import Students from "@/pages/Students";
import Progress from "@/pages/Progress";
import CourseManagement from "@/pages/CourseManagement";
import ReviewSubmissions from "@/pages/ReviewSubmissions";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminDashboard from "@/pages/AdminDashboard";
import UserManagement from "@/pages/UserManagement";
import Profile from "@/pages/Profile";
import Accounting from "@/pages/Accounting";
import DailyActivitiesManagement from './pages/DailyActivitiesManagement';
import Wiki from '@/pages/Wiki';
import WikiCategory from '@/pages/WikiCategory';
import WikiArticle from '@/pages/WikiArticle';
import CreateWikiArticle from '@/pages/CreateWikiArticle';
import WikiManagement from '@/pages/WikiManagement';
import TeammatesDashboard from '@/pages/TeammatesDashboard';
import TasksManagement from './pages/TasksManagement';
import TeammateTasks from './pages/TeammateTasks';

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { profile } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Specific dashboard routes */}
      <Route 
        path="/dashboard/trainer" 
        element={
          <ProtectedRoute requiredRole="trainer">
            <TrainerDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/dashboard/trainee" 
        element={
          <ProtectedRoute requiredRole="trainee">
            <TraineeDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/dashboard/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* User Management - Admin only */}
      <Route 
        path="/user-management" 
        element={
          <ProtectedRoute requiredRole="admin">
            <UserManagement />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/courses" 
        element={
          <ProtectedRoute>
            {profile?.role === 'trainer' ? <Courses /> : <StudentCourses />}
          </ProtectedRoute>
        } 
      />
      
      {/* Add the student-courses route */}
      <Route 
        path="/student-courses" 
        element={
          <ProtectedRoute requiredRole="trainee">
            <StudentCourses />
          </ProtectedRoute>
        } 
      />
      
      {/* Profile route - accessible to all authenticated users */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      
      {/* Updated to allow both trainers and admins */}
      <Route 
        path="/courses-management" 
        element={
          <ProtectedRoute>
            {(profile?.role === 'trainer' || profile?.role === 'admin') ? (
              <CourseManagement />
            ) : (
              <NotFound />
            )}
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/instructors" 
        element={
          <ProtectedRoute>
            <Instructors />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/exercises" 
        element={
          <ProtectedRoute>
            <Exercises />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/my-exercises" 
        element={
          <ProtectedRoute>
            <MyExercises />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/exercises/:id" 
        element={
          <ProtectedRoute>
            <ExerciseDetail />
          </ProtectedRoute>
        } 
      />
      
      {/* Review Submissions - Trainers and Admins only */}
      <Route 
        path="/review-submissions" 
        element={
          <ProtectedRoute>
            {(profile?.role === 'trainer' || profile?.role === 'admin') ? (
              <ReviewSubmissions />
            ) : (
              <NotFound />
            )}
          </ProtectedRoute>
        } 
      />
      
      {/* Updated to allow both trainers and admins */}
      <Route 
        path="/students" 
        element={
          <ProtectedRoute>
            {(profile?.role === 'trainer' || profile?.role === 'admin') ? (
              <Students />
            ) : (
              <NotFound />
            )}
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/progress" 
        element={
          <ProtectedRoute>
            <Progress />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/accounting" 
        element={
          <ProtectedRoute requiredRole="admin">
            <Accounting />
          </ProtectedRoute>
        } 
      />
      
      <Route path="/daily-activities-management" element={<DailyActivitiesManagement />} />
      
      {/* Wiki Routes */}
      <Route path="/wiki" element={<Wiki />} />
      <Route path="/wiki/category/:categoryId" element={<WikiCategory />} />
      <Route path="/wiki/article/:articleId" element={<WikiArticle />} />
      <Route path="/wiki/create-article" element={<CreateWikiArticle />} />
      <Route path="/wiki/manage" element={<WikiManagement />} />
      
      <Route 
        path="/dashboard/teammate" 
        element={
          <ProtectedRoute requiredRole="teammate">
            <TeammatesDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/tasks-management" 
        element={
          <ProtectedRoute requiredRole="admin">
            <TasksManagement />
          </ProtectedRoute>
        } 
      />
      
      <Route
        path="/tasks"
        element={
          <ProtectedRoute requiredRole="teammate">
            <TeammateTasks />
          </ProtectedRoute>
        }
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-background font-sans antialiased w-full">
              <Suspense fallback={<div>Loading...</div>}>
                <AppRoutes />
              </Suspense>
              <Toaster />
              <Sonner />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
