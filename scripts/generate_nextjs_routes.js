const fs = require('fs');
const path = require('path');

const routes = [
  // Trainee routes
  { path: 'app/trainee/[courseId]/my-exercises/page.tsx', component: 'MyExercises', role: 'trainee' },
  { path: 'app/trainee/[courseId]/progress/page.tsx', component: 'Progress', role: 'trainee' },
  { path: 'app/trainee/[courseId]/student-courses/page.tsx', component: 'StudentCourses', role: 'trainee' },
  { path: 'app/trainee/[courseId]/profile/page.tsx', component: 'Profile', role: 'trainee' },
  { path: 'app/trainee/[courseId]/exercises/page.tsx', component: 'Exercises', role: 'trainee' },
  { path: 'app/trainee/[courseId]/exercise/[id]/page.tsx', component: 'ExerciseDetail', role: 'trainee' },
  { path: 'app/trainee/[courseId]/notifications/page.tsx', component: 'NotificationsPage', role: 'trainee' },
  
  // Trainer routes
  { path: 'app/trainer/dashboard/page.tsx', component: 'TrainerDashboard', role: 'trainer' },
  { path: 'app/trainer/courses/page.tsx', component: 'Courses', role: 'trainer' },
  { path: 'app/trainer/courses-management/page.tsx', component: 'CourseManagement', role: 'trainer' },
  { path: 'app/trainer/review-submissions/page.tsx', component: 'ReviewSubmissions', role: 'trainer' },
  { path: 'app/trainer/students/page.tsx', component: 'Students', role: 'trainer' },
  { path: 'app/trainer/profile/page.tsx', component: 'Profile', role: 'trainer' },
  { path: 'app/trainer/exercises/page.tsx', component: 'Exercises', role: 'trainer' },
  { path: 'app/trainer/exercise/[id]/page.tsx', component: 'ExerciseDetail', role: 'trainer' },
  { path: 'app/trainer/notifications/page.tsx', component: 'NotificationsPage', role: 'trainer' },
  
  // Admin routes
  { path: 'app/admin/dashboard/page.tsx', component: 'AdminDashboard', role: 'admin' },
  { path: 'app/admin/user-management/page.tsx', component: 'UserManagement', role: 'admin' },
  { path: 'app/admin/courses-management/page.tsx', component: 'CourseManagement', role: 'admin' },
  { path: 'app/admin/students/page.tsx', component: 'Students', role: 'admin' },
  { path: 'app/admin/exercises/page.tsx', component: 'Exercises', role: 'admin' },
  { path: 'app/admin/exercise/[id]/page.tsx', component: 'ExerciseDetail', role: 'admin' },
  { path: 'app/admin/review-submissions/page.tsx', component: 'ReviewSubmissions', role: 'admin' },
  { path: 'app/admin/accounting/page.tsx', component: 'Accounting', role: 'admin' },
  { path: 'app/admin/profile/page.tsx', component: 'Profile', role: 'admin' },
  { path: 'app/admin/notifications/page.tsx', component: 'NotificationsPage', role: 'admin' },
  

  
  // Other routes
  { path: 'app/instructors/page.tsx', component: 'Instructors', role: null },
];

function generatePageContent(component, role) {
  const importStatement = component === 'NotificationsPage' 
    ? 'import NotificationsPage from "@/pages/notifications";'
    : `import { ${component} } from "@/components/pages";`;
    
  const protectedRoute = role 
    ? `<ProtectedRoute requiredRole="${role}">\n      <${component} />\n    </ProtectedRoute>`
    : `<${component} />`;

  return `'use client';

${importStatement}
${role ? 'import ProtectedRoute from "@/components/auth/ProtectedRoute";' : ''}

export default function ${component}Page() {
  return (
    ${protectedRoute}
  );
}`;
}

// Create directories and files
routes.forEach(route => {
  const dir = path.dirname(route.path);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const content = generatePageContent(route.component, route.role);
  fs.writeFileSync(route.path, content);
  console.log(`Created: ${route.path}`);
});

console.log('All route pages generated successfully!'); 