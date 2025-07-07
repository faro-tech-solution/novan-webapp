import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { queryClient } from "@/lib/react-query";

// Import all pages from the restructured directories
import {
  // Auth pages
  Login,
  Register,
  ForgetPassword,
  // Dashboard pages
  Dashboard,
  AdminDashboard,
  TrainerDashboard,
  TraineeDashboard,
  TeammatesDashboard,
  // Exercise pages
  Exercises,
  ExerciseDetail,
  MyExercises,
  ReviewSubmissions,
  // Course pages
  Courses,
  StudentCourses,
  CourseManagement,
  // Management pages
  UserManagement,
  GroupManagement,
  TasksManagement,
  DailyActivitiesManagement,
  // Wiki pages
  Wiki,
  WikiArticle,
  WikiCategory,
  CreateWikiArticle,
  WikiManagement,
  // User pages
  Students,
  Instructors,
  Profile,
  Progress,
  // Accounting pages
  Accounting,
  // Shared pages
  NotFound,
  TeammateTasks,
} from "@/pages";
import NotificationsPage from "@/pages/notifications";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Use the queryClient from @/lib/react-query

const AppRoutes = () => {
  const { profile } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forget_password" element={<ForgetPassword />} />

      {/* Trainee Routes */}
      <Route path="/trainee/dashboard" element={<ProtectedRoute requiredRole="trainee"><TraineeDashboard /></ProtectedRoute>} />
      <Route path="/trainee/my-exercises" element={<ProtectedRoute requiredRole="trainee"><MyExercises /></ProtectedRoute>} />
      <Route path="/trainee/progress" element={<ProtectedRoute requiredRole="trainee"><Progress /></ProtectedRoute>} />
      <Route path="/trainee/student-courses" element={<ProtectedRoute requiredRole="trainee"><StudentCourses /></ProtectedRoute>} />
      <Route path="/trainee/profile" element={<ProtectedRoute requiredRole="trainee"><Profile /></ProtectedRoute>} />
      <Route path="/trainee/exercises" element={<ProtectedRoute requiredRole="trainee"><Exercises /></ProtectedRoute>} />
      <Route path="/trainee/exercise/:id" element={<ProtectedRoute requiredRole="trainee"><ExerciseDetail /></ProtectedRoute>} />
      <Route path="/trainee/wiki" element={<ProtectedRoute requiredRole="trainee"><Wiki /></ProtectedRoute>} />
      <Route path="/trainee/wiki/category/:categoryId" element={<ProtectedRoute requiredRole="trainee"><WikiCategory /></ProtectedRoute>} />
      <Route path="/trainee/wiki/article/:articleId" element={<ProtectedRoute requiredRole="trainee"><WikiArticle /></ProtectedRoute>} />
      <Route path="/trainee/wiki/create-article" element={<ProtectedRoute requiredRole="trainee"><CreateWikiArticle /></ProtectedRoute>} />
      <Route path="/trainee/wiki/manage" element={<ProtectedRoute requiredRole="trainee"><WikiManagement /></ProtectedRoute>} />
      <Route path="/trainee/notifications" element={<ProtectedRoute requiredRole="trainee"><NotificationsPage /></ProtectedRoute>} />

      {/* Trainer Routes */}
      <Route path="/trainer/dashboard" element={<ProtectedRoute requiredRole="trainer"><TrainerDashboard /></ProtectedRoute>} />
      <Route path="/trainer/courses" element={<ProtectedRoute requiredRole="trainer"><Courses /></ProtectedRoute>} />
      <Route path="/trainer/courses-management" element={<ProtectedRoute requiredRole="trainer"><CourseManagement /></ProtectedRoute>} />
      <Route path="/trainer/review-submissions" element={<ProtectedRoute requiredRole="trainer"><ReviewSubmissions /></ProtectedRoute>} />
      <Route path="/trainer/students" element={<ProtectedRoute requiredRole="trainer"><Students /></ProtectedRoute>} />
      <Route path="/trainer/profile" element={<ProtectedRoute requiredRole="trainer"><Profile /></ProtectedRoute>} />
      <Route path="/trainer/exercises" element={<ProtectedRoute requiredRole="trainer"><Exercises /></ProtectedRoute>} />
      <Route path="/trainer/exercise/:id" element={<ProtectedRoute requiredRole="trainer"><ExerciseDetail /></ProtectedRoute>} />
      <Route path="/trainer/wiki" element={<ProtectedRoute requiredRole="trainer"><Wiki /></ProtectedRoute>} />
      <Route path="/trainer/wiki/category/:categoryId" element={<ProtectedRoute requiredRole="trainer"><WikiCategory /></ProtectedRoute>} />
      <Route path="/trainer/wiki/article/:articleId" element={<ProtectedRoute requiredRole="trainer"><WikiArticle /></ProtectedRoute>} />
      <Route path="/trainer/wiki/create-article" element={<ProtectedRoute requiredRole="trainer"><CreateWikiArticle /></ProtectedRoute>} />
      <Route path="/trainer/wiki/manage" element={<ProtectedRoute requiredRole="trainer"><WikiManagement /></ProtectedRoute>} />
      <Route path="/trainer/profile" element={<ProtectedRoute requiredRole="trainer"><Profile /></ProtectedRoute>} />
      <Route path="/trainer/notifications" element={<ProtectedRoute requiredRole="trainer"><NotificationsPage /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/user-management" element={<ProtectedRoute requiredRole="admin"><UserManagement /></ProtectedRoute>} />
      <Route path="/admin/group-management" element={<ProtectedRoute requiredRole="admin"><GroupManagement /></ProtectedRoute>} />
      <Route path="/admin/courses-management" element={<ProtectedRoute requiredRole="admin"><CourseManagement /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute requiredRole="admin"><Students /></ProtectedRoute>} />
      <Route path="/admin/exercises" element={<ProtectedRoute requiredRole="admin"><Exercises /></ProtectedRoute>} />
      <Route path="/admin/exercise/:id" element={<ProtectedRoute requiredRole="admin"><ExerciseDetail /></ProtectedRoute>} />
      <Route path="/admin/review-submissions" element={<ProtectedRoute requiredRole="admin"><ReviewSubmissions /></ProtectedRoute>} />
      <Route path="/admin/accounting" element={<ProtectedRoute requiredRole="admin"><Accounting /></ProtectedRoute>} />
      <Route path="/admin/wiki/manage" element={<ProtectedRoute requiredRole="admin"><WikiManagement /></ProtectedRoute>} />
      <Route path="/admin/tasks-management" element={<ProtectedRoute requiredRole="admin"><TasksManagement /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute requiredRole="admin"><Profile /></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute requiredRole="admin"><NotificationsPage /></ProtectedRoute>} />

      {/* Teammate Routes */}
      <Route path="/teammate/dashboard" element={<ProtectedRoute requiredRole="teammate"><TeammatesDashboard /></ProtectedRoute>} />
      <Route path="/teammate/tasks" element={<ProtectedRoute requiredRole="teammate"><TeammateTasks /></ProtectedRoute>} />
      <Route path="/teammate/profile" element={<ProtectedRoute requiredRole="teammate"><Profile /></ProtectedRoute>} />
      <Route path="/teammate/notifications" element={<ProtectedRoute requiredRole="teammate"><NotificationsPage /></ProtectedRoute>} />

      {/* Shared/Other Routes (if any remain) */}
      <Route path="/instructors" element={<ProtectedRoute><Instructors /></ProtectedRoute>} />
      <Route path="/daily-activities-management" element={<DailyActivitiesManagement />} />
      {/* NotFound fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Suspense fallback={<div>Loading...</div>}>
            <AppRoutes />
          </Suspense>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </TooltipProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
