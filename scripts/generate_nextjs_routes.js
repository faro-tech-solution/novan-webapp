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
  { path: 'app/trainee/[courseId]/wiki/page.tsx', component: 'Wiki', role: 'trainee' },
  { path: 'app/trainee/[courseId]/wiki/category/[categoryId]/page.tsx', component: 'WikiCategory', role: 'trainee' },
  { path: 'app/trainee/[courseId]/wiki/article/[articleId]/page.tsx', component: 'WikiArticle', role: 'trainee' },
  { path: 'app/trainee/[courseId]/wiki/create-article/page.tsx', component: 'CreateWikiArticle', role: 'trainee' },
  { path: 'app/trainee/[courseId]/wiki/manage/page.tsx', component: 'WikiManagement', role: 'trainee' },
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
  { path: 'app/trainer/wiki/page.tsx', component: 'Wiki', role: 'trainer' },
  { path: 'app/trainer/wiki/category/[categoryId]/page.tsx', component: 'WikiCategory', role: 'trainer' },
  { path: 'app/trainer/wiki/article/[articleId]/page.tsx', component: 'WikiArticle', role: 'trainer' },
  { path: 'app/trainer/wiki/create-article/page.tsx', component: 'CreateWikiArticle', role: 'trainer' },
  { path: 'app/trainer/wiki/manage/page.tsx', component: 'WikiManagement', role: 'trainer' },
  { path: 'app/trainer/notifications/page.tsx', component: 'NotificationsPage', role: 'trainer' },
  
  // Admin routes
  { path: 'app/admin/dashboard/page.tsx', component: 'AdminDashboard', role: 'admin' },
  { path: 'app/admin/user-management/page.tsx', component: 'UserManagement', role: 'admin' },
  { path: 'app/admin/group-management/page.tsx', component: 'GroupManagement', role: 'admin' },
  { path: 'app/admin/courses-management/page.tsx', component: 'CourseManagement', role: 'admin' },
  { path: 'app/admin/students/page.tsx', component: 'Students', role: 'admin' },
  { path: 'app/admin/exercises/page.tsx', component: 'Exercises', role: 'admin' },
  { path: 'app/admin/exercise/[id]/page.tsx', component: 'ExerciseDetail', role: 'admin' },
  { path: 'app/admin/review-submissions/page.tsx', component: 'ReviewSubmissions', role: 'admin' },
  { path: 'app/admin/accounting/page.tsx', component: 'Accounting', role: 'admin' },
  { path: 'app/admin/wiki/manage/page.tsx', component: 'WikiManagement', role: 'admin' },
  { path: 'app/admin/tasks-management/page.tsx', component: 'TasksManagement', role: 'admin' },
  { path: 'app/admin/profile/page.tsx', component: 'Profile', role: 'admin' },
  { path: 'app/admin/notifications/page.tsx', component: 'NotificationsPage', role: 'admin' },
  
  // Teammate routes
  { path: 'app/teammate/dashboard/page.tsx', component: 'TeammatesDashboard', role: 'teammate' },
  { path: 'app/teammate/tasks/page.tsx', component: 'TeammateTasks', role: 'teammate' },
  { path: 'app/teammate/profile/page.tsx', component: 'Profile', role: 'teammate' },
  { path: 'app/teammate/notifications/page.tsx', component: 'NotificationsPage', role: 'teammate' },
  
  // Other routes
  { path: 'app/instructors/page.tsx', component: 'Instructors', role: null },
  { path: 'app/daily-activities-management/page.tsx', component: 'DailyActivitiesManagement', role: null },
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