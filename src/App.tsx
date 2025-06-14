
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import Instructors from "./pages/Instructors";
import CourseDetail from "./pages/CourseDetail";
import Dashboard from "./pages/Dashboard";
import TrainerDashboard from "./pages/TrainerDashboard";
import TraineeDashboard from "./pages/TraineeDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ExerciseDetail from "./pages/ExerciseDetail";
import CourseManagement from "./pages/CourseManagement";
import MyExercises from "./pages/MyExercises";
import Progress from "./pages/Progress";
import StudentCourses from "./pages/StudentCourses";
import Exercises from "./pages/Exercises";
import Students from "./pages/Students";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/instructors" element={<Instructors />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/trainer" element={
              <ProtectedRoute requiredRole="trainer">
                <TrainerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/trainee" element={
              <ProtectedRoute requiredRole="trainee">
                <TraineeDashboard />
              </ProtectedRoute>
            } />
            <Route path="/exercise/:id" element={
              <ProtectedRoute>
                <ExerciseDetail />
              </ProtectedRoute>
            } />
            <Route path="/exercises" element={
              <ProtectedRoute requiredRole="trainer">
                <Exercises />
              </ProtectedRoute>
            } />
            <Route path="/courses-management" element={
              <ProtectedRoute requiredRole="trainer">
                <CourseManagement />
              </ProtectedRoute>
            } />
            <Route path="/my-exercises" element={
              <ProtectedRoute requiredRole="trainee">
                <MyExercises />
              </ProtectedRoute>
            } />
            <Route path="/progress" element={
              <ProtectedRoute requiredRole="trainee">
                <Progress />
              </ProtectedRoute>
            } />
            <Route path="/student-courses" element={
              <ProtectedRoute requiredRole="trainee">
                <StudentCourses />
              </ProtectedRoute>
            } />
            <Route path="/students" element={
              <ProtectedRoute requiredRole="trainer">
                <Students />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
