import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import ClassManagement from "./pages/ClassManagement";
import MyExercises from "./pages/MyExercises";
import Progress from "./pages/Progress";
import StudentCourses from "./pages/StudentCourses";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/instructors" element={<Instructors />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/trainer" element={<TrainerDashboard />} />
          <Route path="/dashboard/trainee" element={<TraineeDashboard />} />
          <Route path="/exercise/:id" element={<ExerciseDetail />} />
          <Route path="/classes" element={<ClassManagement />} />
          <Route path="/my-exercises" element={<MyExercises />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/student-courses" element={<StudentCourses />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
