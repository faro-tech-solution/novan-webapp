
import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import TrainerDashboard from "@/pages/TrainerDashboard";
import TraineeDashboard from "@/pages/TraineeDashboard";
import Courses from "@/pages/Courses";
import AllCourses from "@/pages/AllCourses";
import StudentCourses from "@/pages/StudentCourses";
import CourseDetail from "@/pages/CourseDetail";
import CourseDetailPage from "@/pages/CourseDetailPage";
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

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { profile } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Public course pages */}
      <Route path="/all-courses" element={<AllCourses />} />
      <Route path="/course/:id" element={<CourseDetailPage />} />
      
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
      
      <Route 
        path="/courses/:id" 
        element={
          <ProtectedRoute>
            <CourseDetail />
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
            <div className="min-h-screen bg-background font-sans antialiased">
              <Suspense fallback={<div>Loading...</div>}>
                <AppRoutes />
              </Suspense>
              <Toaster />
              <Sonner />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
