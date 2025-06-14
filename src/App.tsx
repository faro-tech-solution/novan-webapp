
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
import StudentCourses from "@/pages/StudentCourses";
import CourseDetail from "@/pages/CourseDetail";
import Instructors from "@/pages/Instructors";
import Exercises from "@/pages/Exercises";
import MyExercises from "@/pages/MyExercises";
import ExerciseDetail from "@/pages/ExerciseDetail";
import Students from "@/pages/Students";
import Progress from "@/pages/Progress";
import CourseManagement from "@/pages/CourseManagement";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { profile } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            {profile?.role === 'trainer' ? <TrainerDashboard /> : <TraineeDashboard />}
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
      
      <Route 
        path="/courses/:id" 
        element={
          <ProtectedRoute>
            <CourseDetail />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/courses-management" 
        element={
          <ProtectedRoute requiredRole="trainer">
            <CourseManagement />
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
      
      <Route 
        path="/students" 
        element={
          <ProtectedRoute requiredRole="trainer">
            <Students />
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
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
