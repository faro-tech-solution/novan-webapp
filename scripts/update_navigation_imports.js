const fs = require('fs');
const path = require('path');

// Files that need React Router to Next.js navigation updates
const filesToUpdate = [
  'src/pages/notifications.tsx',
  'src/pages/exercises/ExerciseDetail.tsx',
  'src/pages/dashboard/AdminDashboard.tsx',
  'src/pages/dashboard/TrainerDashboard.tsx',
  'src/pages/courses/StudentCourses.tsx',
  'src/pages/shared/NotFound.tsx',
  'src/pages/dashboard/Dashboard.tsx',
  'src/pages/wiki/CreateWikiArticle.tsx',
  'src/pages/wiki/WikiArticle.tsx',
  'src/pages/wiki/Wiki.tsx',
  'src/pages/wiki/WikiCategory.tsx',
  'src/pages/wiki/WikiManagement.tsx',
  'src/pages/auth/Register.tsx',
  'src/components/dashboard/UpcomingExercisesCard.tsx',
  'src/components/exercises/MyExerciseTable.tsx',
  'src/components/management/InstructorCard.tsx',
  'src/components/layout/NotificationBell.tsx',
  'src/pages/auth/ForgetPassword.tsx',
  'src/components/layout/Header.tsx',
  'src/components/layout/DashboardLayout.tsx',
  'src/pages/auth/Login.tsx'
];

function updateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // Add 'use client' directive if not present and file uses client-side features
  if (!content.includes("'use client'") && (
    content.includes('useNavigate') || 
    content.includes('useLocation') || 
    content.includes('useParams') ||
    content.includes('useState') ||
    content.includes('useEffect')
  )) {
    content = "'use client';\n\n" + content;
    updated = true;
  }

  // Replace React Router imports with Next.js navigation
  if (content.includes("from 'react-router-dom'") || content.includes('from "react-router-dom"')) {
    content = content.replace(
      /import\s*{\s*([^}]*)\s*}\s*from\s*['"]react-router-dom['"]/g,
      (match, imports) => {
        const importList = imports.split(',').map(imp => imp.trim());
        const nextImports = [];
        const reactRouterImports = [];

        importList.forEach(imp => {
          if (imp === 'useNavigate') {
            nextImports.push('useRouter');
          } else if (imp === 'useLocation') {
            nextImports.push('usePathname', 'useSearchParams');
          } else if (imp === 'useParams') {
            nextImports.push('useParams');
          } else if (imp === 'Link') {
            nextImports.push('Link');
          } else {
            reactRouterImports.push(imp);
          }
        });

        let result = '';
        if (nextImports.length > 0) {
          result += `import { ${nextImports.join(', ')} } from 'next/navigation';\n`;
        }
        if (reactRouterImports.length > 0) {
          result += `import { ${reactRouterImports.join(', ')} } from 'react-router-dom';\n`;
        }
        return result;
      }
    );
    updated = true;
  }

  // Update useNavigate to useRouter
  if (content.includes('useNavigate')) {
    content = content.replace(/const\s+navigate\s*=\s*useNavigate\(\)/g, 'const router = useRouter()');
    content = content.replace(/navigate\(/g, 'router.push(');
    updated = true;
  }

  // Update useLocation to usePathname and useSearchParams
  if (content.includes('useLocation')) {
    content = content.replace(
      /const\s+location\s*=\s*useLocation\(\)/g,
      'const pathname = usePathname();\n  const searchParams = useSearchParams()'
    );
    content = content.replace(/location\.pathname/g, 'pathname');
    content = content.replace(/location\.search/g, 'searchParams.toString()');
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  } else {
    console.log(`No changes needed: ${filePath}`);
  }
}

filesToUpdate.forEach(updateFile);
console.log('Navigation imports updated successfully!'); 