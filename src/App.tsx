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
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Use the queryClient from @/lib/react-query

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

      {/* Group Management - Admin only */}
      <Route
        path="/group-management"
        element={
          <ProtectedRoute requiredRole="admin">
            <GroupManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            {profile?.role === "trainer" ? <Courses /> : <StudentCourses />}
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

      {/* Course Management - Admin and Trainer */}
      <Route
        path="/courses-management"
        element={
          <ProtectedRoute>
            {profile?.role === "trainer" || profile?.role === "admin" ? (
              <CourseManagement />
            ) : (
              <NotFound />
            )}
          </ProtectedRoute>
        }
      />

      {/* Exercises routes */}
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
          <ProtectedRoute requiredRole="trainee">
            <MyExercises />
          </ProtectedRoute>
        }
      />

      <Route
        path="/exercise/:id"
        element={
          <ProtectedRoute>
            <ExerciseDetail />
          </ProtectedRoute>
        }
      />

      {/* Review Submissions - Admin and Trainer */}
      <Route
        path="/review-submissions"
        element={
          <ProtectedRoute>
            {profile?.role === "trainer" || profile?.role === "admin" ? (
              <ReviewSubmissions />
            ) : (
              <NotFound />
            )}
          </ProtectedRoute>
        }
      />

      {/* Students - Admin and Trainer */}
      <Route
        path="/students"
        element={
          <ProtectedRoute>
            {profile?.role === "trainer" || profile?.role === "admin" ? (
              <Students />
            ) : (
              <NotFound />
            )}
          </ProtectedRoute>
        }
      />

      {/* Instructors - All authenticated users */}
      <Route
        path="/instructors"
        element={
          <ProtectedRoute>
            <Instructors />
          </ProtectedRoute>
        }
      />

      {/* Progress - Trainee only */}
      <Route
        path="/progress"
        element={
          <ProtectedRoute requiredRole="trainee">
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

      <Route
        path="/daily-activities-management"
        element={<DailyActivitiesManagement />}
      />

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

      <Route path="/forget_password" element={<ForgetPassword />} />

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
